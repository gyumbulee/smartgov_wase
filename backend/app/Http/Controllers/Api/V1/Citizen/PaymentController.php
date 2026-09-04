<?php

namespace App\Http\Controllers\Api\V1\Citizen;

use App\Http\Controllers\Controller;
use App\Http\Resources\PaymentResource;
use App\Models\Applications\Application;
use App\Services\Payment\PaymentService;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $paymentService)
    {
    }

    public function initialize(Request $request, Application $application)
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen && $application->citizen_id === $citizen->id, 403, 'Not your application.');

        try {
            $result = $this->paymentService->initialize($application, $this->callbackUrl());
        } catch (\RuntimeException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json([
            'checkout_url' => $result['checkout_url'],
            'payment_reference' => $result['payment']->payment_reference,
        ]);
    }

    public function current(Request $request, Application $application)
    {
        $citizen = $request->user()->citizenProfile;
        abort_unless($citizen && $application->citizen_id === $citizen->id, 403, 'Not your application.');

        $payment = $application->payments()->latest()->with('receipt')->first();

        return $payment ? new PaymentResource($payment) : response()->json(null);
    }

    public function history(Request $request)
    {
        $citizen = $request->user()->citizenProfile;

        $payments = $citizen
            ? $citizen->applications()
                ->with(['payments' => fn ($q) => $q->with('receipt', 'application.service')])
                ->get()
                ->pluck('payments')
                ->flatten()
                ->sortByDesc('created_at')
                ->values()
            : collect();

        return PaymentResource::collection($payments);
    }

    /**
     * The Laravel-side callback URL that the gateway (or our stub)
     * redirects the citizen's browser back to after checkout. This is
     * a backend route (public, verified server-side) — it then
     * redirects the browser onward to the frontend application page.
     */
    private function callbackUrl(): string
    {
        return rtrim(config('app.url'), '/').'/api/v1/public/payments/callback';
    }
}
