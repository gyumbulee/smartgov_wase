<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 1 note: tables created now so the schema is stable, but the
     * IdentityVerificationService integration itself is Phase 2 work.
     * No live NIN provider is wired in this phase.
     */
    public function up(): void
    {
        Schema::create('identity_providers', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 150);
            $table->string('code', 50)->unique();
            $table->string('provider_type', 50);
            $table->boolean('is_active')->default(false);
            $table->json('configuration')->nullable();
            $table->timestamps();
        });

        Schema::create('identity_verifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignUlid('citizen_id')->nullable()->constrained('citizen_profiles')->nullOnDelete();
            $table->string('provider', 100);
            $table->string('verification_type', 50)->default('NIN');
            $table->string('provider_reference')->nullable();
            $table->string('request_reference')->unique();
            $table->string('nin_hash')->nullable();
            $table->text('encrypted_nin')->nullable();
            $table->enum('status', ['pending', 'verified', 'failed'])->default('pending');
            $table->timestamp('verified_at')->nullable();
            $table->string('response_code', 100)->nullable();
            $table->text('response_message')->nullable();
            $table->json('response_metadata')->nullable();
            $table->timestamps();

            $table->index('nin_hash');
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('identity_verifications');
        Schema::dropIfExists('identity_providers');
    }
};
