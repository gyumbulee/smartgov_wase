Fix: no MIME-type allowlist on document uploads (Security hardening #4)
==========================================================================

Cause: UploadApplicationDocumentRequest only validated
'file' => ['required', 'file', 'max:10240'] — no extension/MIME
restriction. The controller (ApplicationDocumentController::store)
does separately check a requirement's accepted_file_types, but that
field is optional on ServiceRequirement — if an admin leaves it
blank for a given requirement, literally any file extension was
accepted for that upload (.php, .exe, .html, .svg, etc). Mitigated
somewhat by files landing on a private, non-web-accessible disk,
but still a real gap.

File changed:
  backend/app/Http/Requests/Citizen/UploadApplicationDocumentRequest.php

Added 'mimes:pdf,jpg,jpeg,png' as a hard baseline ceiling — mirrors
the existing pattern already used for file size (a 10MB ceiling
that applies regardless of what a requirement configures). This
matches the file types actually used across your seeded service
requirements (pdf,jpg,png). A requirement's own accepted_file_types
can still narrow this further in the controller; it just can no
longer widen past this baseline.

Note: Laravel's mimes rule checks actual file content (via Symfony's
mime-type guesser), not just the extension in the filename or the
client-supplied Content-Type header — so renaming a malicious file
to document.pdf won't bypass it.

Apply:
  1. Overwrite this 1 file in your repo with the version in this
     zip.
  2. No .env/config changes, no cache to clear.
  3. Test: try uploading a .txt or .exe file as an application
     document — should now be rejected with a validation error
     instead of accepted.

  git add -A
  git commit -m "Security: restrict application document uploads to pdf/jpg/jpeg/png by default"
  git push
