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

];
