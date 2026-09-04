<?php

return [
    // Which PaymentGatewayInterface implementation to bind. See
    // App\Providers\PaymentServiceProvider. 'stub' must never be used
    // outside local/dev — the provider refuses to bind it in production.
    'gateway' => env('PAYMENT_GATEWAY', 'stub'),

    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
        'webhook_secret_hash' => env('FLUTTERWAVE_WEBHOOK_SECRET_HASH'),
    ],

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),
];
