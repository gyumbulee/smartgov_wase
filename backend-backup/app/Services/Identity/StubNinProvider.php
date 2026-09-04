<?php

namespace App\Services\Identity;

/**
 * Local/development stub. Deterministically "verifies" any well-formed
 * 11-digit NIN so the registration flow can be built and tested end to
 * end before a real government-authorized provider is contracted.
 *
 * For testing the eligibility gate (residence must be Wase, Plateau
 * State — see EligibilityVerificationService), this stub alternates:
 * NINs ending in an EVEN digit resolve to a Wase, Plateau resident
 * (eligible); NINs ending in an ODD digit resolve to a non-Wase
 * resident (ineligible). This is purely a dev/testing convenience.
 *
 * NEVER use this in production. Replace with a real provider adapter
 * (implementing NinProviderInterface) once authorization is obtained,
 * and switch NIN_PROVIDER in .env accordingly.
 */
class StubNinProvider implements NinProviderInterface
{
    public function verify(string $nin): array
    {
        if (! preg_match('/^\d{11}$/', $nin)) {
            return [
                'success' => false,
                'provider_reference' => null,
                'response_code' => 'INVALID_FORMAT',
                'response_message' => 'NIN must be 11 digits.',
                'identity' => null,
                'raw' => [],
            ];
        }

        $lastDigit = (int) substr($nin, -1);
        $isWaseResident = $lastDigit % 2 === 0;

        return [
            'success' => true,
            'provider_reference' => 'STUB-'.$nin,
            'response_code' => 'OK',
            'response_message' => 'Verified (stub provider — development only).',
            'identity' => [
                'first_name' => 'Demo',
                'middle_name' => null,
                'last_name' => 'Citizen',
                'date_of_birth' => '1990-01-01',
                'gender' => 'undisclosed',
                'phone' => null,
                // Residential address as recorded against the NIN — this is
                // what eligibility is evaluated against, per business rule.
                'residence_state' => $isWaseResident ? 'Plateau' : 'Kaduna',
                'residence_lga' => $isWaseResident ? 'Wase' : 'Zaria',
            ],
            'raw' => ['stub' => true, 'nin_suffix' => substr($nin, -4)],
        ];
    }

    public function providerCode(): string
    {
        return 'stub';
    }
}

