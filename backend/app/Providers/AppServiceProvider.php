<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // General ceiling for every API request — generous enough not to
        // interfere with normal use, just there to blunt scripted abuse.
        // Keyed by user id when authenticated, otherwise IP, so one
        // heavy citizen can't exhaust another's quota.
        RateLimiter::for('api', function ($request) {
            return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
        });

        // Credential-guessing surfaces: login, registration completion,
        // forgot/reset password. Keyed by IP + the submitted identifier
        // (email/etc.) so an attacker spraying many emails from one IP
        // is still caught per-target, not just per-IP.
        RateLimiter::for('auth', function ($request) {
            $identifier = $request->input('email') ?: $request->input('phone') ?: 'unknown';

            return Limit::perMinute(5)->by($request->ip().'|'.$identifier);
        });

        // NIN verification: sensitive on two fronts — brute-forcing NIN
        // numbers, and probing which NINs resolve as Wase-eligible
        // (residence/eligibility enumeration). Kept tighter and keyed
        // by IP only, since there's no separate account identifier yet
        // at this point in the flow.
        RateLimiter::for('nin-verify', function ($request) {
            return Limit::perMinute(5)->by($request->ip());
        });
    }
}
