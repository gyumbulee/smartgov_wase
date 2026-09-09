<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class CompleteRegistrationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'request_reference' => ['required', 'string', 'exists:identity_verifications,request_reference'],
            'email' => ['required', 'email', 'unique:users,email'],
            // min:8 alone allowed anything meeting length, including
            // passwords found in known breach datasets. letters()+
            // numbers() sets a low-friction floor; uncompromised()
            // checks against Have I Been Pwned's breached-password
            // corpus via k-anonymity (the plaintext password never
            // leaves this server) and rejects only if it's actually
            // been seen in a breach.
            'password' => ['required', 'confirmed', Password::min(8)->letters()->numbers()->uncompromised()],
        ];
    }
}
