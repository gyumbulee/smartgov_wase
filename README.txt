Fix: minimal password policy (Security hardening #6)
========================================================

Cause: both registration and password reset only validated
'min:8|confirmed' — any 8+ character string passed, including
common/known-breached passwords like "password1" or "12345678".

Files changed:
  backend/app/Http/Requests/Auth/CompleteRegistrationRequest.php
  backend/app/Http/Controllers/Api/V1/Auth/PasswordResetController.php

Both now use Laravel's Password rule object:
  Password::min(8)->letters()->numbers()->uncompromised()

- letters()/numbers(): low-friction floor, not full complexity
  rules (no forced symbols/mixed-case — that tends to just push
  people toward "Password1" patterns).
- uncompromised(): checks the password against Have I Been Pwned's
  breached-password database using k-anonymity — only a partial
  hash prefix is sent, the actual plaintext password never leaves
  this server. Requires outbound internet access from wherever this
  runs; if that request fails/times out, Laravel's rule fails open
  (treats it as not compromised) rather than blocking registration
  entirely, so this is safe even in an environment without reliable
  outbound access.

Note the PasswordResetController file already had
`use Illuminate\Support\Facades\Password;` imported for the
password-reset broker — the validation rule class is imported
separately as `PasswordRule` to avoid a naming collision.

Apply:
  1. Overwrite these 2 files in your repo with the versions in this
     zip.
  2. No .env/config changes, no cache to clear.
  3. Test: try registering/resetting with a known weak password like
     "password1" — should be rejected as compromised. A password
     like "Wase2026Portal" (8+ chars, letters+numbers, not a known
     breach) should pass.

  git add -A
  git commit -m "Security: require letters+numbers and check against known breaches on password set/reset"
  git push
