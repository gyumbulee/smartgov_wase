<?php

namespace App\Providers;

use App\Services\Payment\FlutterwaveGateway;
use App\Services\Payment\PaymentGatewayInterface;
use App\Services\Payment\StubPaymentGateway;
use Illuminate\Support\ServiceProvider;
use RuntimeException;

/**
 * Binds the active payment gateway implementation based on
 * config/payment.php. To add a real gateway: implement
 * PaymentGatewayInterface, register it below, and set PAYMENT_GATEWAY
 * in .env — nothing else changes (same pattern as IdentityServiceProvider).
 */
class PaymentServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(PaymentGatewayInterface::class, function () {
            $gateway = config('payment.gateway', 'stub');

            if ($gateway === 'stub' && $this->app->environment('production')) {
                throw new RuntimeException(
                    'PAYMENT_GATEWAY=stub must never be used in production — it accepts fake payments.'
                );
            }

            return match ($gateway) {
                'flutterwave' => new FlutterwaveGateway(config('payment.flutterwave.secret_key') ?? ''),
                default => new StubPaymentGateway(),
            };
        });
    }
}
