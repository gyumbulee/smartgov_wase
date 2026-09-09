<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Active payment gateway
    |--------------------------------------------------------------------------
    |
    | "stub" (default) simulates a gateway locally via the /mock-checkout
    | page — see StubPaymentGateway and PaymentStubController. Set to
    | "flutterwave" to use the real gateway (PaymentServiceProvider
    | refuses to bind "stub" in production either way).
    |
    | This key was missing from this file, so config('payment.gateway')
    | resolved to null everywhere it was read. PaymentServiceProvider
    | happens to pass a default ('stub') so gateway binding still
    | worked — but PaymentStubController::simulate() checks
    | config('payment.gateway') !== 'stub' with no default, so it saw
    | null !== 'stub' and always returned 404 "Stub payment simulation
    | is not available." The simulated outcome was therefore never
    | recorded, so the callback's verify() step always found nothing
    | to confirm and treated the payment as failed.
    |
    */

    'gateway' => env('PAYMENT_GATEWAY', 'stub'),

    /*
    |--------------------------------------------------------------------------
    | Frontend URL
    |--------------------------------------------------------------------------
    |
    | The base URL of the Next.js frontend. Used to build URLs that the
    | *browser* needs to land on after leaving this API — the mock/stub
    | checkout page (StubPaymentGateway), the payment gateway callback
    | redirect (PaymentCallbackController), and certificate verification
    | links (CertificateGenerationService).
    |
    | This file was missing entirely, so config('payment.frontend_url')
    | resolved to null everywhere it was used, which turned each of
    | those URLs into a bare relative path (e.g. "/applications/{id}"
    | instead of "http://localhost:3000/applications/{id}"). Landing on
    | a bare relative path is harmless when the browser is already on
    | the frontend origin, but PaymentCallbackController is hit as a
    | direct browser navigation against *this* (the backend's) origin,
    | so the relative redirect kept the browser on the backend — which
    | has no such web route — producing a 404.
    |
    */

    'frontend_url' => env('FRONTEND_URL', 'http://localhost:3000'),

    /*
    |--------------------------------------------------------------------------
    | Flutterwave
    |--------------------------------------------------------------------------
    |
    | Used by FlutterwaveGateway (payment initialize/verify) and
    | PaymentWebhookController (webhook signature check) once
    | PAYMENT_GATEWAY is switched from "stub" to "flutterwave" for
    | production. These two keys were referenced via
    | config('payment.flutterwave.*') but never defined anywhere in
    | this file — since the file didn't exist at all until the
    | 'gateway'/'frontend_url' fix above, and this block was missed
    | at the time.
    |
    | Left unset (null) by default is intentional and safe here: with
    | PAYMENT_GATEWAY still at its "stub" default, secret_key is never
    | used, and webhook_secret_hash being empty makes the webhook
    | correctly reject every request (see PaymentWebhookController) —
    | it fails closed, not open. Both MUST be set in the real .env
    | before ever switching PAYMENT_GATEWAY to "flutterwave".
    |
    */

    'flutterwave' => [
        'public_key' => env('FLUTTERWAVE_PUBLIC_KEY'),
        'secret_key' => env('FLUTTERWAVE_SECRET_KEY'),
        'webhook_secret_hash' => env('FLUTTERWAVE_WEBHOOK_SECRET_HASH'),
    ],

];
