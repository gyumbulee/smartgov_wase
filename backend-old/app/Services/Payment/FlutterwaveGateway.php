<?php

namespace App\Services\Payment;

use App\Models\Payments\Payment;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Flutterwave "Standard" checkout integration. Uses their documented
 * REST API directly (no SDK dependency): initialize a payment link,
 * then verify server-side via the transaction verify endpoint.
 *
 * Requires FLUTTERWAVE_SECRET_KEY (and FLUTTERWAVE_PUBLIC_KEY for the
 * dashboard reference, though the secret key is what's used here).
 * Never wired in as the active gateway without those being configured
 * — see PaymentServiceProvider.
 */
class FlutterwaveGateway implements PaymentGatewayInterface
{
    private const BASE_URL = 'https://api.flutterwave.com/v3';

    public function __construct(private readonly string $secretKey)
    {
    }

    public function initialize(Payment $payment, string $redirectUrl): array
    {
        $response = Http::withToken($this->secretKey)
            ->post(self::BASE_URL.'/payments', [
                'tx_ref' => $payment->payment_reference,
                'amount' => (string) $payment->amount,
                'currency' => $payment->currency,
                'redirect_url' => $redirectUrl,
                'customer' => [
                    'email' => $payment->citizen->user->email ?? null,
                    'name' => $payment->citizen->fullName(),
                ],
                'customizations' => [
                    'title' => 'SmartGov-Wase',
                    'description' => 'Payment for '.($payment->application->service->name ?? 'government service'),
                ],
            ]);

        if (! $response->successful() || $response->json('status') !== 'success') {
            Log::warning('Flutterwave payment initialization failed', [
                'payment_id' => $payment->id,
                'response' => $response->json(),
            ]);

            throw new \RuntimeException('Unable to start payment with the gateway. Please try again.');
        }

        return [
            'checkout_url' => $response->json('data.link'),
            'gateway_reference' => null, // Flutterwave assigns this on verification, not initialization
            'raw' => $response->json(),
        ];
    }

    public function verify(string $gatewayTransactionReference): array
    {
        $response = Http::withToken($this->secretKey)
            ->get(self::BASE_URL."/transactions/{$gatewayTransactionReference}/verify");

        $data = $response->json('data');

        $success = $response->successful()
            && $response->json('status') === 'success'
            && ($data['status'] ?? null) === 'successful';

        return [
            'success' => $success,
            'amount' => isset($data['amount']) ? (float) $data['amount'] : null,
            'currency' => $data['currency'] ?? null,
            'response_code' => $data['status'] ?? 'unknown',
            'raw' => $response->json() ?? [],
        ];
    }

    public function gatewayCode(): string
    {
        return 'flutterwave';
    }
}
