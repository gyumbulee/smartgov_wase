<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /** Schema only in Phase 1 — PDF template engine + generation ships in Phase 6. */
    public function up(): void
    {
        Schema::create('certificate_templates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('code')->unique();
            $table->text('description')->nullable();
            $table->foreignUlid('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->string('document_type')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('inactive');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('certificate_template_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_id')->constrained('certificate_templates')->cascadeOnDelete();
            $table->string('version');
            $table->ulid('file_media_id')->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->timestamp('effective_from')->nullable();
            $table->timestamp('effective_until')->nullable();
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('certificate_template_fields', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('template_version_id')->constrained('certificate_template_versions')->cascadeOnDelete();
            $table->string('field_key');
            $table->string('data_source');
            $table->integer('x_position')->nullable();
            $table->integer('y_position')->nullable();
            $table->integer('width')->nullable();
            $table->integer('height')->nullable();
            $table->string('font_family')->nullable();
            $table->integer('font_size')->nullable();
            $table->string('font_style')->nullable();
            $table->string('alignment')->nullable();
            $table->string('color', 20)->nullable();
            $table->string('format_rule')->nullable();
            $table->timestamps();
        });

        Schema::create('certificates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('certificate_number')->unique();
            $table->foreignUlid('application_id')->constrained('applications')->restrictOnDelete();
            $table->foreignUlid('citizen_id')->constrained('citizen_profiles')->restrictOnDelete();
            $table->foreignUlid('service_id')->constrained('services')->restrictOnDelete();
            $table->foreignUlid('template_version_id')->nullable()->constrained('certificate_template_versions')->nullOnDelete();
            $table->string('certificate_type');
            $table->date('issue_date');
            $table->enum('status', ['generated', 'active', 'revoked', 'expired'])->default('generated');
            $table->ulid('file_media_id')->nullable();
            $table->string('verification_code')->unique();
            $table->text('qr_payload')->nullable();
            $table->timestamp('generated_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->text('revocation_reason')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('certificate_verifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('certificate_id')->constrained('certificates')->cascadeOnDelete();
            $table->string('verification_reference')->nullable();
            $table->timestamp('verified_at');
            $table->string('ip_address', 45)->nullable();
            $table->string('user_agent')->nullable();
            $table->string('result');
            $table->json('metadata')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('numbering_sequences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('document_type')->unique();
            $table->string('prefix');
            $table->year('year');
            $table->unsignedBigInteger('current_number')->default(0);
            $table->unsignedTinyInteger('padding')->default(6);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('numbering_sequences');
        Schema::dropIfExists('certificate_verifications');
        Schema::dropIfExists('certificates');
        Schema::dropIfExists('certificate_template_fields');
        Schema::dropIfExists('certificate_template_versions');
        Schema::dropIfExists('certificate_templates');
    }
};
