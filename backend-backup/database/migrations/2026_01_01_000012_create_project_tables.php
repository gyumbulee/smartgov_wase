<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('projects', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('project_code')->nullable();
            $table->longText('description')->nullable();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUlid('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignUlid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->string('location_description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('contractor')->nullable();
            $table->decimal('budget', 15, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->date('start_date')->nullable();
            $table->date('expected_completion_date')->nullable();
            $table->date('actual_completion_date')->nullable();
            $table->unsignedTinyInteger('progress_percentage')->default(0);
            $table->enum('status', ['proposed', 'approved', 'ongoing', 'completed', 'suspended', 'cancelled'])->default('proposed');
            $table->boolean('featured')->default(false);
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('ward_id');
        });

        Schema::create('project_updates', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('project_id')->constrained('projects')->cascadeOnDelete();
            $table->string('title');
            $table->longText('description')->nullable();
            $table->unsignedTinyInteger('progress_percentage')->nullable();
            $table->string('status')->nullable();
            $table->timestamp('published_at')->nullable();
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('project_updates');
        Schema::dropIfExists('projects');
    }
};
