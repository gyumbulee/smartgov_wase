<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Models\Payments\Payment;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;

/**
 * The browser lands here after checkout (gateway redirect, or our
 * stub's mock checkout). Per spec §11/§15: "Never rely solely on
 * frontend payment confirmation" — this always re-verifies with the
 * gateway server-side before treating the payment as successful. The
 * query-string status param, if present, is never trusted on its own.
 */
class PaymentCallbackController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function __invoke(Request $request): RedirectResponse
    {
        $reference = $request->query('tx_ref') ?? $request->query('payment_reference');
        $frontendUrl = rtrim(config('payment.frontend_url'), '/');

        $payment = $reference ? Payment::where('payment_reference', $reference)->first() : null;

        if (! $payment) {
            return redirect()->away("{$frontendUrl}/applications?payment=error");
        }

        $confirmed = $this->paymentService->verifyAndConfirm($payment);

        $applicationId = $payment->application_id;
        $status = $confirmed ? 'success' : 'failed';

        return redirect()->away("{$frontendUrl}/applications/{$applicationId}?payment={$status}");
    }
}
