<?php

namespace App\Services\Payment;

use App\Models\Payments\Payment;
use Illuminate\Support\Facades\Cache;

/**
 * Local/development stub. Mimics a real gateway's round trip — redirect
 * to a "checkout" page, then redirect back to our callback with a
 * result — without contacting any external service. The simulated
 * outcome is stashed in cache keyed by payment_reference and consumed
 * exactly once by verify(), so PaymentCallbackController's code path
 * is identical regardless of which gateway is active.
 *
 * NEVER bound as the active gateway in production — see
 * PaymentServiceProvider, which refuses to bind this outside local/dev.
 */
class StubPaymentGateway implements PaymentGatewayInterface
{
    private const CACHE_PREFIX = 'stub_payment_outcome:';
    private const CACHE_TTL_MINUTES = 15;

    public function initialize(Payment $payment, string $redirectUrl): array
    {
        $checkoutUrl = rtrim(config('payment.frontend_url'), '/')
            .'/mock-checkout?ref='.urlencode($payment->payment_reference)
            .'&amount='.urlencode((string) $payment->amount)
            .'&currency='.urlencode($payment->currency)
            .'&redirect='.urlencode($redirectUrl);

        return [
            'checkout_url' => $checkoutUrl,
            'gateway_reference' => $payment->payment_reference,
            'raw' => ['stub' => true],
        ];
    }

    public static function recordSimulatedOutcome(string $paymentReference, bool $successful): void
    {
        Cache::put(self::CACHE_PREFIX.$paymentReference, $successful, now()->addMinutes(self::CACHE_TTL_MINUTES));
    }

    public function verify(string $gatewayTransactionReference): array
    {
        $key = self::CACHE_PREFIX.$gatewayTransactionReference;
        $outcome = Cache::pull($key); // pull = read + forget, single use

        if ($outcome === null) {
            return [
                'success' => false,
                'amount' => null,
                'currency' => null,
                'response_code' => 'NO_SIMULATED_OUTCOME',
                'raw' => ['stub' => true],
            ];
        }

        return [
            'success' => (bool) $outcome,
            'amount' => null, // stub trusts PaymentService's own stored amount rather than asserting one
            'currency' => null,
            'response_code' => $outcome ? 'successful' : 'failed',
            'raw' => ['stub' => true],
        ];
    }

    public function gatewayCode(): string
    {
        return 'stub';
    }
}
