<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | This file didn't exist at all. Laravel's HandleCors middleware
    | reads its settings from config('cors'); with no file, that
    | resolves to nothing, so cross-origin requests from the Next.js
    | frontend (a different origin from this API) had no defined,
    | explicit CORS policy to rely on in production.
    |
    | Scoped to exactly FRONTEND_URL (the same variable introduced for
    | payment/certificate redirects — see config/payment.php) rather
    | than a wildcard, since the API is only ever meant to be called
    | from this one frontend, not from arbitrary origins.
    |
    | supports_credentials is false because auth here is a Bearer
    | token sent via the Authorization header (see frontend
    | lib/api.ts), not cookie-based — so the browser doesn't need to
    | send/receive cookies cross-origin for this API.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
