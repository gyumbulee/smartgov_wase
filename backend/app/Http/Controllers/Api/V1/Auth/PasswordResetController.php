<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password as PasswordRule;

/**
 * Uses Laravel's standard password broker (spec §64) — not reinvented.
 */
class PasswordResetController extends Controller
{
    public function sendResetLink(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), ['email' => 'required|email']);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        return $status === Password::RESET_LINK_SENT
            ? response()->json(['message' => 'Password reset link sent.'])
            : response()->json(['message' => 'Unable to send reset link.'], 422);
    }

    public function reset(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required',
            'email' => 'required|email',
            // Same policy as registration (CompleteRegistrationRequest):
            // min:8 alone let through anything of that length, including
            // known-breached passwords. This adds a low-friction
            // letters+numbers floor plus a Have I Been Pwned breach
            // check (k-anonymity — the plaintext password never leaves
            // this server).
            'password' => ['required', 'confirmed', PasswordRule::min(8)->letters()->numbers()->uncompromised()],
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->forceFill(['password' => bcrypt($password)])->save();
            }
        );

        return $status === Password::PASSWORD_RESET
            ? response()->json(['message' => 'Password reset successful.'])
            : response()->json(['message' => 'Unable to reset password.'], 422);
    }
}
