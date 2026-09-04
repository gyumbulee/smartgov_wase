<?php

namespace App\Actions\Citizen;

use App\Models\Citizen\CitizenProfile;
use App\Models\Citizen\IdentityVerification;
use App\Models\User;
use Illuminate\Support\Str;

/**
 * Reuses verified identity data to populate the citizen profile rather
 * than asking the citizen to re-enter it (spec §6, §8, principle #2).
 */
class CreateOrUpdateCitizenProfile
{
    public function handle(User $user, IdentityVerification $verification): CitizenProfile
    {
        $identity = $verification->response_metadata['identity'] ?? [];

        $citizen = CitizenProfile::firstOrNew(['user_id' => $user->id]);

        $citizen->fill([
            'citizen_reference' => $citizen->citizen_reference ?? $this->generateReference(),
            'first_name' => $identity['first_name'] ?? $citizen->first_name ?? '',
            'middle_name' => $identity['middle_name'] ?? $citizen->middle_name,
            'last_name' => $identity['last_name'] ?? $citizen->last_name ?? '',
            'date_of_birth' => $identity['date_of_birth'] ?? $citizen->date_of_birth,
            'gender' => $identity['gender'] ?? $citizen->gender,
            'phone' => $identity['phone'] ?? $citizen->phone,
            // NOTE: reusing the state_of_origin/lga_of_origin columns to
            // record NIN-registered *residential* address, since that is
            // what the eligibility rule is evaluated against — not
            // indigene origin. Revisit naming if a real origin field is
            // needed separately in a later phase.
            'state_of_origin' => $identity['residence_state'] ?? $citizen->state_of_origin,
            'lga_of_origin' => $identity['residence_lga'] ?? $citizen->lga_of_origin,
            'identity_status' => 'verified',
            // The Wase-residence eligibility gate already passed before a
            // user account (and therefore this profile) could be created —
            // see NinVerificationController / CitizenRegistrationController.
            'eligibility_status' => 'verified',
            'profile_completed_at' => now(),
        ]);
        $citizen->save();

        $verification->update(['citizen_id' => $citizen->id]);

        return $citizen;
    }

    private function generateReference(): string
    {
        return 'CTZ-'.now()->format('Y').'-'.Str::upper(Str::random(8));
    }
}
