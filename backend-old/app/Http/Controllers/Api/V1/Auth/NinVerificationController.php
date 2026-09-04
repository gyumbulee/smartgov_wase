<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SubmitNinRequest;
use App\Services\Identity\IdentityVerificationService;
use Illuminate\Http\JsonResponse;

/**
 * Step 1 of citizen onboarding (business rule): NIN -> identity
 * verification -> eligibility gate (residence in Wase, Plateau State)
 * -> account creation. Someone whose identity verifies but whose
 * residence is NOT Wase, Plateau is blocked right here — they never
 * receive a usable request_reference and cannot reach registration.
 */
class NinVerificationController extends Controller
{
    public function __construct(private readonly IdentityVerificationService $identityService)
    {
    }

    public function submit(SubmitNinRequest $request): JsonResponse
    {
        $verification = $this->identityService->verifyNin($request->string('nin'));

        if (! $this->identityService->isVerified($verification)) {
            return response()->json([
                'verified' => false,
                'eligible' => false,
                'message' => $verification->response_message,
            ], 422);
        }

        if (! $this->identityService->isEligible($verification)) {
            return response()->json([
                'verified' => true,
                'eligible' => false,
                'message' => $this->identityService->eligibilityReason($verification)
                    ?? 'SmartGov-Wase accounts are only available to residents of Wase, Plateau State.',
            ], 403);
        }

        return response()->json([
            'verified' => true,
            'eligible' => true,
            'request_reference' => $verification->request_reference,
            'identity_preview' => [
                'first_name' => $verification->response_metadata['identity']['first_name'] ?? null,
                'last_name' => $verification->response_metadata['identity']['last_name'] ?? null,
            ],
            'message' => 'Identity and eligibility verified. Continue to create your account.',
        ]);
    }

    public function status(string $requestReference): JsonResponse
    {
        $verification = $this->identityService->findVerification($requestReference);

        if (! $verification) {
            return response()->json(['message' => 'Verification reference not found.'], 404);
        }

        return response()->json([
            'status' => $verification->status,
            'eligible' => $this->identityService->isEligible($verification),
            'verified_at' => $verification->verified_at?->toIso8601String(),
        ]);
    }
}
