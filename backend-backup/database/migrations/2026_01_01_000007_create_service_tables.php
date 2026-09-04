<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Configuration-driven services engine (spec: do NOT hard-code a
     * separate module per certificate type). Full application/payment/
     * certificate wiring against these tables happens in later phases;
     * this phase establishes the schema and basic CRUD/admin structure.
     */
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->ulid('image_media_id')->nullable();
            $table->integer('sort_order')->default(0);
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('services', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('service_code')->unique();
            $table->string('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->foreignUlid('category_id')->nullable()->constrained('service_categories')->nullOnDelete();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->text('eligibility_description')->nullable();
            $table->decimal('fee', 15, 2)->default(0);
            $table->string('currency', 3)->default('NGN');
            $table->integer('estimated_processing_minutes')->nullable();
            $table->enum('status', ['draft', 'active', 'suspended', 'retired'])->default('draft');
            $table->boolean('is_online')->default(true);
            $table->boolean('requires_identity_verification')->default(true);
            $table->boolean('requires_eligibility_verification')->default(false);
            $table->boolean('requires_payment')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
        });

        Schema::create('service_fields', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('field_key');
            $table->string('label');
            $table->string('field_type', 30); // text, textarea, date, select, radio, checkbox, number, email, phone, file, address
            $table->string('placeholder')->nullable();
            $table->string('help_text')->nullable();
            $table->string('default_value')->nullable();
            $table->json('options')->nullable();
            $table->boolean('is_required')->default(false);
            $table->boolean('is_readonly')->default(false);
            $table->boolean('is_system_field')->default(false);
            $table->json('validation_rules')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            $table->unique(['service_id', 'field_key']);
        });

        Schema::create('service_requirements', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('requirement_type', 50)->default('document');
            $table->boolean('is_required')->default(true);
            $table->string('accepted_file_types')->nullable();
            $table->unsignedInteger('max_file_size')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('service_workflows', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('name');
            $table->string('version')->default('1');
            $table->json('definition');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('service_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->string('version');
            $table->json('configuration');
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->enum('status', ['draft', 'active', 'archived'])->default('draft');
            $table->timestamps();
        });

        Schema::create('service_fee_versions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('service_id')->constrained('services')->cascadeOnDelete();
            $table->decimal('amount', 15, 2);
            $table->string('currency', 3)->default('NGN');
            $table->timestamp('effective_from');
            $table->timestamp('effective_until')->nullable();
            $table->enum('status', ['scheduled', 'active', 'expired'])->default('scheduled');
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('service_fee_versions');
        Schema::dropIfExists('service_versions');
        Schema::dropIfExists('service_workflows');
        Schema::dropIfExists('service_requirements');
        Schema::dropIfExists('service_fields');
        Schema::dropIfExists('services');
        Schema::dropIfExists('service_categories');
    }
};
