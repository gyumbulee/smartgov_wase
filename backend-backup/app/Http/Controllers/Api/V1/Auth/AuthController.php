<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

/**
 * Phase 1 baseline auth. NIN-based identity/eligibility verification
 * (spec §6) is Phase 2 — this covers plain email/password account
 * creation for staff/admin accounts and the citizen shell only.
 * Full citizen onboarding must go through the NIN verification flow
 * once IdentityVerificationService is implemented.
 */
class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'pending',
        ]);

        $citizenRole = Role::where('slug', 'citizen')->first();
        if ($citizenRole) {
            $user->roles()->attach($citizenRole->id);
        }

        $token = $user->createToken('citizen-portal')->plainTextToken;

        return response()->json([
            'message' => 'Account created. Complete NIN verification to activate full citizen features.',
            'user' => $user->only('id', 'email', 'status'),
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (! Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

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
