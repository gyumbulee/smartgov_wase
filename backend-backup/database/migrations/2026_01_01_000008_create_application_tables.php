<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Schema only in Phase 1 — the application/automation engine ships in Phase 4. */
    public function up(): void
    {
        Schema::create('applications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('application_reference')->unique();
            $table->foreignUlid('citizen_id')->constrained('citizen_profiles')->cascadeOnDelete();
            $table->foreignUlid('service_id')->constrained('services')->restrictOnDelete();
            $table->enum('status', [
                'draft', 'submitted', 'payment_pending', 'paid', 'processing',
                'completed', 'correction_required', 'failed', 'cancelled',
            ])->default('draft');
            $table->string('current_step')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('processing_started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->text('failure_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->json('configuration_snapshot')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('citizen_id');
            $table->index('service_id');
            $table->index('status');
            $table->index('created_at');
        });

        Schema::create('application_field_values', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUlid('service_field_id')->constrained('service_fields')->cascadeOnDelete();
            $table->string('field_key');
            $table->text('value_text')->nullable();
            $table->json('value_json')->nullable();
            $table->timestamps();
        });

        Schema::create('application_documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->foreignUlid('requirement_id')->nullable()->constrained('service_requirements')->nullOnDelete();
            $table->ulid('media_id')->nullable();
            $table->string('document_type')->nullable();
            $table->string('original_filename')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('file_size')->nullable();
            $table->enum('status', ['uploaded', 'accepted', 'rejected', 'expired'])->default('uploaded');
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
        });

        Schema::create('application_status_history', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('application_id')->constrained('applications')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignUlid('changed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('application_status_history');
        Schema::dropIfExists('application_documents');
        Schema::dropIfExists('application_field_values');
        Schema::dropIfExists('applications');
    }
};
