<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Phase 2: citizen account creation now happens exclusively through the
 * NIN verification flow — see NinVerificationController (submit NIN)
 * and CitizenRegistrationController (complete registration). There is
 * no direct "register a citizen with just email/password" endpoint
 * anymore, since that would bypass identity verification entirely
 * (spec §6). Staff/admin accounts are provisioned by administrators,
 * not through a public endpoint. This controller now only handles
 * login/logout/me for already-created accounts of any role.
 */
class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Deliberately NOT using Auth::attempt() here: it operates on the
        // session-based 'web' guard, and routes/api.php only conditionally
        // provides a session (via statefulApi()'s stateful-domain check).
        // This API issues Sanctum bearer tokens and never relies on
        // cookies/sessions, so we check credentials directly instead —
        // this avoids a "Session store not set on request" failure mode
        // that would otherwise surface as a misleading generic error.
        $user = User::where('email', $request->string('email'))->first();

        if (! $user || ! Hash::check($request->string('password'), $user->password)) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->status !== 'active' && $user->status !== 'pending') {
            return response()->json(['message' => 'Account is not active.'], 403);
        }

        $user->update(['last_login_at' => now(), 'last_login_ip' => $request->ip()]);

        $token = $user->createToken('api')->plainTextToken;

        return response()->json([
            'user' => $user->only('id', 'email', 'status'),
            'roles' => $user->roles()->pluck('slug'),
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out.']);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('roles');

        return response()->json([
            'user' => $user->only('id', 'email', 'status', 'email_verified_at'),
            'roles' => $user->roles->pluck('slug'),
        ]);
    }
}
