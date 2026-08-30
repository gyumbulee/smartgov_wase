<?php

return [
    // Which NinProviderInterface implementation to bind. See
    // App\Providers\IdentityServiceProvider.
    'nin_provider' => env('NIN_PROVIDER', 'stub'),

    'providers' => [
        'stub' => [
            // No configuration required — development/testing only.
        ],
        // 'youverify' => [
        //     'base_url' => env('NIN_PROVIDER_BASE_URL'),
        //     'api_key' => env('NIN_PROVIDER_API_KEY'),
        // ],
    ],
];
