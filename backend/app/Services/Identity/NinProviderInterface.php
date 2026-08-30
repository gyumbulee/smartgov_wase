<?php

namespace App\Services\Identity;

/**
 * Contract every NIN provider integration must satisfy.
 *
 * The rest of the platform depends only on this interface, never on a
 * concrete provider class, so swapping providers later (spec §59) never
 * requires touching IdentityVerificationService or controllers.
 */
interface NinProviderInterface
{
    /**
     * Verify a NIN with the provider and return a normalized response.
     *
     * @return array{
     *   success: bool,
     *   provider_reference: ?string,
     *   response_code: string,
     *   response_message: string,
     *   identity: ?array{first_name: string, middle_name: ?string, last_name: string,
     *                     date_of_birth: ?string, gender: ?string, phone: ?string},
     *   raw: array
     * }
     */
    public function verify(string $nin): array;

    public function providerCode(): string;
}
