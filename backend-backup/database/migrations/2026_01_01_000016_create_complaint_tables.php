<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('complaint_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('complaints', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('complaint_reference')->unique();
            $table->foreignUlid('citizen_id')->nullable()->constrained('citizen_profiles')->nullOnDelete();
            $table->foreignUlid('category_id')->constrained('complaint_categories')->restrictOnDelete();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('title');
            $table->longText('description');
            $table->string('location')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->enum('priority', ['low', 'normal', 'high', 'urgent'])->default('normal');
            $table->enum('status', ['submitted', 'received', 'assigned', 'in_progress', 'resolved', 'closed', 'rejected'])->default('submitted');
            $table->foreignUlid('assigned_to')->nullable()->constrained('staff')->nullOnDelete();
            $table->timestamp('submitted_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index('status');
        });

        Schema::create('complaint_updates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('complaint_id')->constrained('complaints')->cascadeOnDelete();
            $table->foreignUlid('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status');
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('complaint_updates');
        Schema::dropIfExists('complaints');
        Schema::dropIfExists('complaint_categories');
    }
};
