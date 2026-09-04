<?php

namespace App\Http\Controllers\Api\V1\Public;

use App\Http\Controllers\Controller;
use App\Services\Payment\StubPaymentGateway;
use Illuminate\Http\Request;

/**
 * Backs the mock checkout page (frontend /mock-checkout) used only
 * when PAYMENT_GATEWAY=stub. Records the citizen's simulated choice
 * (pay / fail) so StubPaymentGateway::verify() can "confirm" it when
 * the browser is redirected to the real callback endpoint — keeping
 * the stub gateway on the exact same code path as a real one.
 *
 * Hard-refuses to do anything unless the stub gateway is actually the
 * configured one, so this can never be used to fake a payment against
 * a real Flutterwave-backed environment.
 */
class PaymentStubController extends Controller
{
    public function simulate(Request $request)
    {
        if (config('payment.gateway') !== 'stub' || app()->environment('production')) {
            return response()->json(['message' => 'Stub payment simulation is not available.'], 404);
        }

        $request->validate([
            'payment_reference' => ['required', 'string'],
            'outcome' => ['required', 'in:success,failed'],
        ]);

        StubPaymentGateway::recordSimulatedOutcome(
            $request->string('payment_reference'),
            $request->string('outcome') === 'success'
        );

        return response()->json(['message' => 'Recorded.']);
    }
}
