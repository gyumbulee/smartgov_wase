<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Payments\Payment;
use App\Models\Payments\PaymentWebhookEvent;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

/**
 * Flutterwave webhook receiver — the source-of-truth confirmation
 * channel independent of whether the citizen's browser ever makes it
 * back to the callback URL (spec §11: payment confirmation must be
 * server-side/webhook-based, never solely frontend-driven).
 *
 * Idempotent per spec §24/§71: payment_webhook_events.event_reference
 * is unique, and an already-processed event is a no-op, not an error.
 */
class PaymentWebhookController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function __invoke(Request $request)
    {
        $signature = $request->header('verif-hash');
        $expected = config('payment.flutterwave.webhook_secret_hash');

        if (! $expected || ! $signature || ! hash_equals($expected, $signature)) {
            Log::warning('Payment webhook received with invalid or missing signature.');
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $payload = $request->all();
        $eventReference = $payload['data']['id'] ?? $payload['data']['tx_ref'] ?? null;

        if (! $eventReference) {
            return response()->json(['message' => 'Missing event reference.'], 422);
        }

        $existing = PaymentWebhookEvent::where('event_reference', (string) $eventReference)->first();
        if ($existing && $existing->processed) {
            return response()->json(['message' => 'Already processed.']); // idempotent no-op
        }

        $event = $existing ?? PaymentWebhookEvent::create([
            'gateway' => 'flutterwave',
            'event_type' => $payload['event'] ?? 'unknown',
            'event_reference' => (string) $eventReference,
            'payload' => $payload,
            'signature' => $signature,
            'signature_verified' => true,
            'processed' => false,
            'created_at' => now(),
        ]);

        $txRef = $payload['data']['tx_ref'] ?? null;
        $payment = $txRef ? Payment::where('payment_reference', $txRef)->first() : null;

        if ($payment) {
            $status = $payload['data']['status'] ?? null;
            if ($status === 'successful') {
                $this->paymentService->confirmSuccessful($payment, ['raw' => $payload]);
            } elseif (in_array($status, ['failed', 'cancelled'], true)) {
                $this->paymentService->markFailed($payment, ['raw' => $payload]);
            }
        } else {
            Log::warning('Payment webhook could not resolve a matching payment.', ['tx_ref' => $txRef]);
        }

        $event->update(['processed' => true, 'processed_at' => now()]);

        return response()->json(['message' => 'Processed.']);
    }
}
