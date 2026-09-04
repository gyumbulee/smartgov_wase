<?php

namespace App\Services\Payment;

use App\Models\Payments\Payment;

/**
 * Contract every payment gateway integration must satisfy. The rest of
 * the platform depends only on this interface (spec §15/§59 pattern
 * applied to payments) so swapping gateways later never touches
 * PaymentService or controllers.
 */
interface PaymentGatewayInterface
{
    /**
     * Start a payment attempt with the gateway and return where the
     * citizen should be sent to complete it.
     *
     * @return array{checkout_url: string, gateway_reference: ?string, raw: array}
     */
    public function initialize(Payment $payment, string $redirectUrl): array;

    /**
     * Verify a transaction directly with the gateway (server-side —
     * never trust a frontend "payment successful" signal, per spec §11).
     *
     * @return array{success: bool, amount: ?float, currency: ?string, response_code: string, raw: array}
     */
    public function verify(string $gatewayTransactionReference): array;

    public function gatewayCode(): string;
}
