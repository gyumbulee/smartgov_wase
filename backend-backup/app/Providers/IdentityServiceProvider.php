<?php

namespace App\Providers;

use App\Services\Identity\NinProviderInterface;
use App\Services\Identity\StubNinProvider;
use Illuminate\Support\ServiceProvider;

/**
 * Binds the active NIN provider implementation based on config/identity.php.
 * To add a real provider: implement NinProviderInterface, register it in
 * the match() below, and set NIN_PROVIDER in .env — nothing else changes.
 */
class IdentityServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(NinProviderInterface::class, function () {
            return match (config('identity.nin_provider', 'stub')) {
                // 'youverify' => new YouverifyNinProvider(...),
                // 'dojah' => new DojahNinProvider(...),
                default => new StubNinProvider(),
            };
        });
    }
}
