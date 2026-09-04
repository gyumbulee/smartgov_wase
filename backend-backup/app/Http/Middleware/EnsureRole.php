<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Server-side role gate. Authorization must NEVER be inferred from
 * email address, frontend routes, or hidden UI (spec §7 of master spec).
 *
 * Usage: ->middleware('role:citizen')  or  ->middleware('role:staff')
 * 'staff' matches any non-citizen role (i.e. any administrative role).
 */
class EnsureRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $authorized = match ($role) {
            'citizen' => $user->isCitizen(),
            'staff' => $user->isStaffOrAdmin(),
            default => $user->hasRole($role),
        };

        if (! $authorized) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
