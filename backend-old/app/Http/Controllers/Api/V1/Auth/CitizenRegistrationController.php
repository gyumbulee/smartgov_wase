<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Actions\Citizen\CreateOrUpdateCitizenProfile;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\CompleteRegistrationRequest;
use App\Http\Resources\CitizenProfileResource;
use App\Models\Citizen\IdentityVerification;
use App\Models\Role;
use App\Models\User;
use App\Services\Identity\IdentityVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * Step 2 of citizen onboarding: citizen supplies email + password to
 * finish account creation, reusing the already-verified identity data
 * rather than re-collecting it. The eligibility gate (residence in
 * Wase, Plateau State) was already enforced at NIN-verification time
 * (NinVerificationController) — this re-checks it as defense in depth
 * in case this endpoint is ever called directly.
 */
class CitizenRegistrationController extends Controller
{
    public function __construct(
        private readonly CreateOrUpdateCitizenProfile $createCitizenProfile,
        private readonly IdentityVerificationService $identityService,
    ) {
    }

    public function complete(CompleteRegistrationRequest $request): JsonResponse
    {
        $verification = IdentityVerification::where('request_reference', $request->string('request_reference'))
            ->where('status', 'verified')
            ->whereNull('user_id')
            ->first();

        if (! $verification) {
            return response()->json([
                'message' => 'This identity verification is invalid, already used, or expired. Please verify your NIN again.',
            ], 422);
        }

        if (! $this->identityService->isEligible($verification)) {
            return response()->json([
                'message' => $this->identityService->eligibilityReason($verification)
                    ?? 'SmartGov-Wase accounts are only available to residents of Wase, Plateau State.',
            ], 403);
        }

        $result = DB::transaction(function () use ($request, $verification) {
            $user = User::create([
                'email' => $request->string('email'),
                'password' => Hash::make($request->string('password')),
                'status' => 'active',
            ]);

            $citizenRole = Role::where('slug', 'citizen')->first();
            if ($citizenRole) {
                $user->roles()->attach($citizenRole->id);
            }

            $verification->update(['user_id' => $user->id]);

            // Eligibility was already confirmed by the gate above, and is
            // carried over onto the citizen profile by the action below.
            $citizen = $this->createCitizenProfile->handle($user, $verification->fresh());

            $token = $user->createToken('citizen-portal')->plainTextToken;

            return [$user, $citizen, $token];
        });

        [$user, $citizen, $token] = $result;

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => $user->only('id', 'email', 'status'),
            'citizen' => new CitizenProfileResource($citizen),
            'token' => $token,
        ], 201);
    }
}
