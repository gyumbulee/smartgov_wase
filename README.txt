Fix: missing Flutterwave config keys (Security hardening #3)
================================================================

Cause: FlutterwaveGateway and PaymentWebhookController both read
config('payment.flutterwave.secret_key') and
config('payment.flutterwave.webhook_secret_hash'), but config/
payment.php never defined a 'flutterwave' block — only 'gateway'
and 'frontend_url' were added in the earlier stub-payment fix.

This wasn't causing a visible bug yet because PAYMENT_GATEWAY still
defaults to "stub" for local dev, and the webhook correctly fails
closed (rejects everything) when the secret is missing. But it
means: the moment PAYMENT_GATEWAY is switched to "flutterwave" for
production, payment initialization and webhook verification will
both be broken until these are set.

Files changed:
  backend/config/payment.php   (added 'flutterwave' block)
  backend/.env.example         (documents the 3 new env vars)

Apply:
  1. Overwrite these 2 files in your repo with the versions in this
     zip.
  2. Before switching to the real gateway in production, add to
     your actual .env (not .env.example):
       PAYMENT_GATEWAY=flutterwave
       FLUTTERWAVE_PUBLIC_KEY=<from Flutterwave dashboard>
       FLUTTERWAVE_SECRET_KEY=<from Flutterwave dashboard>
       FLUTTERWAVE_WEBHOOK_SECRET_HASH=<the "Secret Hash" you set
         on the webhook in the dashboard — not the API secret key>
     For local/dev testing with the stub gateway, no action needed —
     nothing changes.
  3. Run `php artisan config:clear` after applying if you've ever
     cached config.

  git add -A
  git commit -m "Security: add missing Flutterwave config keys (secret_key, webhook_secret_hash)"
  git push
