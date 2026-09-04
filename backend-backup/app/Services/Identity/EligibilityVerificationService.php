<?php

namespace App\Services\Identity;

use App\Models\Citizen\CitizenProfile;

/**
 * Eligibility rule (business decision): a citizen is eligible for a
 * SmartGov-Wase account only if their NIN-registered residential
 * address is in Wase, Plateau State. This is checked immediately after
 * identity verification — someone who is NOT a Wase resident is
 * blocked from account creation entirely, not merely flagged.
 *
 * Kept as a separate service from identity verification (spec §7):
 * identity confirms *who* someone is; this confirms *where* they
 * reside, which is what account eligibility hinges on here.
 */
class EligibilityVerificationService
{
    private const ELIGIBLE_STATE = 'plateau';
    private const ELIGIBLE_LGA = 'wase';

    /**
     * Evaluate eligibility directly from a provider identity payload —
     * used at the NIN-verification step, before any CitizenProfile exists.
     *
     * @return array{status: string, reason: string}
     */
    public function evaluateFromIdentity(array $identity): array
    {
        $state = strtolower(trim($identity['residence_state'] ?? ''));
        $lga = strtolower(trim($identity['residence_lga'] ?? ''));

        if ($state === self::ELIGIBLE_STATE && $lga === self::ELIGIBLE_LGA) {
            return [
                'status' => 'verified',
                'reason' => 'Residential address confirmed in Wase, Plateau State.',
            ];
        }

        return [
            'status' => 'rejected',
            'reason' => 'SmartGov-Wase accounts are only available to residents of Wase, Plateau State.',
        ];
    }

    /**
     * Re-check eligibility against an already-created citizen profile.
     * Used as a defense-in-depth check at registration completion, in
     * case the initial gate is ever bypassed.
     */
    public function evaluate(CitizenProfile $citizen): string
    {
        $state = strtolower(trim($citizen->state_of_origin ?? ''));
        $lga = strtolower(trim($citizen->lga_of_origin ?? ''));

        return ($state === self::ELIGIBLE_STATE && $lga === self::ELIGIBLE_LGA)
            ? 'verified'
            : 'rejected';
    }

    public function markFromResidence(CitizenProfile $citizen): CitizenProfile
    {
        $citizen->update(['eligibility_status' => $this->evaluate($citizen)]);

        return $citizen->fresh();
    }
}
