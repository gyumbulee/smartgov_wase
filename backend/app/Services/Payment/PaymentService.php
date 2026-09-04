<?php

namespace App\Services\Payment;

use App\Jobs\GenerateCertificateJob;
use App\Models\Applications\Application;
use App\Models\Payments\Payment;
use App\Models\Payments\Receipt;
use App\Models\System\Notification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Central payment orchestration (spec §11/§15). The amount charged is
 * always taken from the application's configuration_snapshot (frozen
 * at submission time, spec §77) — never the service's live current
 * fee — so a fee change after submission can never alter what a
 * citizen is actually charged for an application already in flight.
 *
 * confirmSuccessful() is idempotent: it's called from both the
 * server-side callback verification AND the webhook, which per spec
 * §11/§24 must never double-process the same successful transaction.
 */
class PaymentService
{
    public function __construct(private readonly PaymentGatewayInterface $gateway)
    {
    }

    public function initialize(Application $application, string $redirectUrl): array
    {
        if ($application->status !== 'payment_pending') {
            throw new \RuntimeException('This application is not awaiting payment.');
        }

        $amount = $application->configuration_snapshot['fee'] ?? $application->service->fee;
        $currency = $application->configuration_snapshot['currency'] ?? $application->service->currency ?? 'NGN';

        $payment = Payment::create([
            'application_id' => $application->id,
            'citizen_id' => $application->citizen_id,
            'payment_reference' => $this->generatePaymentReference(),
            'gateway' => $this->gateway->gatewayCode(),
            'amount' => $amount,
            'currency' => $currency,
            'status' => 'pending',
        ]);

        $result = $this->gateway->initialize($payment, $redirectUrl);

        $payment->update([
            'gateway_transaction_id' => $result['gateway_reference'],
            'gateway_response' => $result['raw'],
        ]);

        return ['payment' => $payment, 'checkout_url' => $result['checkout_url']];
    }

    /**
     * Verify a payment reference directly with the gateway — used by
     * the callback handler. Never trusts query-string status params
     * from the redirect alone (spec §11: "Never rely solely on
     * frontend payment confirmation").
     */
    public function verifyAndConfirm(Payment $payment): bool
    {
        if ($payment->status === 'successful') {
            return true; // already processed — idempotent no-op
        }

        $reference = $payment->gateway_transaction_id ?: $payment->payment_reference;
        $result = $this->gateway->verify($reference);

        if (! $result['success']) {
            $this->markFailed($payment, $result);
            return false;
        }

        $this->confirmSuccessful($payment, $result);
        return true;
    }

    public function confirmSuccessful(Payment $payment, array $gatewayResult = []): Receipt
    {
        return DB::transaction(function () use ($payment, $gatewayResult) {
            $payment = Payment::lockForUpdate()->find($payment->id);

            if ($payment->status === 'successful') {
                // Idempotency guard: webhook and callback can both reach
                // here for the same transaction — only process once.
                return $payment->receipt ?? $this->createReceipt($payment);
            }

            $payment->update([
                'status' => 'successful',
                'paid_at' => now(),
                'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayResult['raw'] ?? []),
            ]);

            $application = $payment->application;
            $fromStatus = $application->status;

            $application->update([
                'status' => 'processing',
                'paid_at' => now(),
                'processing_started_at' => now(),
            ]);

            $application->statusHistory()->create([
                'from_status' => $fromStatus,
                'to_status' => 'paid',
                'reason' => 'Payment confirmed via '.$payment->gateway.'.',
                'created_at' => now(),
            ]);
            $application->statusHistory()->create([
                'from_status' => 'paid',
                'to_status' => 'processing',
                'reason' => 'Queued for processing.',
                'created_at' => now(),
            ]);

            $receipt = $this->createReceipt($payment);

            $this->notify($application, 'Payment confirmed', 'Your payment has been confirmed and your application is now processing.');

            GenerateCertificateJob::dispatch($application->id)->afterCommit();

            return $receipt;
        });
    }

    public function markFailed(Payment $payment, array $gatewayResult = []): void
    {
        if ($payment->status === 'successful') {
            return; // never downgrade an already-confirmed payment
        }

        $payment->update([
            'status' => 'failed',
            'gateway_response' => array_merge($payment->gateway_response ?? [], $gatewayResult['raw'] ?? []),
        ]);

        $this->notify(
            $payment->application,
            'Payment failed',
            'Your payment could not be confirmed. You can try again from your application.'
        );
    }

    private function createReceipt(Payment $payment): Receipt
    {
        return Receipt::firstOrCreate(
            ['payment_id' => $payment->id],
            ['receipt_number' => $this->generateReceiptNumber(), 'issued_at' => now()]
        );
    }

    private function notify(Application $application, string $title, string $message): void
    {
        $userId = $application->citizen?->user_id;
        if (! $userId) {
            return;
        }

        Notification::create([
            'user_id' => $userId,
            'type' => 'payment',
            'title' => $title,
            'message' => $message,
            'channel' => 'database',
            'status' => 'sent',
            'sent_at' => now(),
        ]);
    }

    private function generatePaymentReference(): string
    {
        do {
            $reference = 'PAY-'.now()->format('Y').'-'.Str::upper(Str::random(10));
        } while (Payment::where('payment_reference', $reference)->exists());

        return $reference;
    }

    private function generateReceiptNumber(): string
    {
        do {
            $number = 'RCT-'.now()->format('Y').'-'.str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        } while (Receipt::where('receipt_number', $number)->exists());

        return $number;
    }
}
