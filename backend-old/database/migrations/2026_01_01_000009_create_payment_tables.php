<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Schema only in Phase 1 — gateway wiring (Flutterwave) ships in Phase 5. */
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUlid('citizen_id')->constrained('citizen_profiles')->cascadeOnDelete();
            $table->string('payment_reference')->unique();
            $table->string('gateway', 50)->default('flutterwave');
            $table->string('gateway_transaction_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->enum('status', ['pending', 'successful', 'failed', 'cancelled', 'refunded'])->default('pending');
            $table->string('payment_method')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->json('gateway_response')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('payment_webhook_events', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('gateway', 50);
            $table->string('event_type');
            $table->string('event_reference')->unique();
            $table->json('payload');
            $table->string('signature')->nullable();
            $table->boolean('signature_verified')->default(false);
            $table->boolean('processed')->default(false);
            $table->timestamp('processed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('receipts', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('payment_id')->constrained('payments')->cascadeOnDelete();
            $table->string('receipt_number')->unique();
            $table->ulid('receipt_media_id')->nullable();
            $table->timestamp('issued_at');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('receipts');
        Schema::dropIfExists('payment_webhook_events');
        Schema::dropIfExists('payments');
    }
};
