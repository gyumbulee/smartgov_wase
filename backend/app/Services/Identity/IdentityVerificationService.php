<?php

namespace App\Services\Identity;

use App\Models\Citizen\IdentityVerification;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Str;

/**
 * IdentityVerificationService — the single entry point the rest of the
 * app uses for NIN verification (spec §59: "Do not hard-code the entire
 * platform around one provider").
 *
 * Identity verification answers ONE question: "is this person the
 * person associated with this NIN?" Eligibility (residence in Wase,
 * Plateau State) is a separate concern evaluated by
 * EligibilityVerificationService, but per business rule it is checked
 * immediately here, at the point of NIN submission — before any
 * account can be created — rather than after the fact.
 */
class IdentityVerificationService
{
    public function __construct(
        private readonly NinProviderInterface $provider,
        private readonly EligibilityVerificationService $eligibilityService,
    ) {
    }

    /**
     * Submit a NIN for verification. Never stores the raw NIN in plaintext
     * columns intended for lookups — only an encrypted copy and a hash.
     * Eligibility is evaluated and persisted alongside the identity result
     * so the registration-completion step can enforce it without
     * re-contacting the provider.
     */
    public function verifyNin(string $nin, ?string $userId = null): IdentityVerification
    {
        $requestReference = 'IDV-'.now()->format('Ymd').'-'.Str::upper(Str::random(8));
        $ninHash = hash('sha256', $nin);

        $result = $this->provider->verify($nin);

        $eligibility = $result['success']
            ? $this->eligibilityService->evaluateFromIdentity($result['identity'] ?? [])
            : ['status' => 'rejected', 'reason' => 'Identity could not be verified.'];

        $record = IdentityVerification::create([
            'user_id' => $userId,
            'provider' => $this->provider->providerCode(),
            'verification_type' => 'NIN',
            'provider_reference' => $result['provider_reference'],
            'request_reference' => $requestReference,
            'nin_hash' => $ninHash,
            'encrypted_nin' => Crypt::encryptString($nin),
            'status' => $result['success'] ? 'verified' : 'failed',
            'verified_at' => $result['success'] ? now() : null,
            'response_code' => $result['response_code'],
            'response_message' => $result['response_message'],
            // Deliberately exclude raw provider payload fields beyond what's
            // needed — minimize what we retain per spec §59/§61.
            'response_metadata' => [
                'identity' => $result['identity'] ?? null,
                'eligibility' => $eligibility,
            ],
        ]);

        return $record;
    }

    public function findVerification(string $requestReference): ?IdentityVerification
    {
        return IdentityVerification::where('request_reference', $requestReference)->first();
    }

    public function isVerified(IdentityVerification $verification): bool
    {
        return $verification->status === 'verified';
    }

    /**
     * Whether this verification's residence gate passed. Identity can be
     * verified while eligibility is rejected (verified person, wrong LGA).
     */
    public function isEligible(IdentityVerification $verification): bool
    {
        return ($verification->response_metadata['eligibility']['status'] ?? null) === 'verified';
    }

    public function eligibilityReason(IdentityVerification $verification): ?string
    {
        return $verification->response_metadata['eligibility']['reason'] ?? null;
    }
}
