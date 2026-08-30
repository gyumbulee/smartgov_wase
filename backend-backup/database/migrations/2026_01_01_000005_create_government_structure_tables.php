<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('departments', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name', 200);
            $table->string('slug', 200)->unique();
            $table->string('short_name', 50)->nullable();
            $table->longText('description')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 50)->nullable();
            $table->text('address')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->integer('sort_order')->default(0);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('staff', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->string('employee_reference')->unique();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->string('position_title')->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('official_email')->nullable();
            $table->enum('status', ['active', 'inactive', 'suspended'])->default('active');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('wards', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('code')->nullable();
            $table->text('description')->nullable();
            $table->json('map_coordinates')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('communities', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('ward_id')->constrained('wards')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->ulid('image_media_id')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('facilities', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->enum('type', ['government_office', 'school', 'health_facility', 'market', 'community_facility', 'other']);
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->foreignUlid('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->foreignUlid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('phone', 30)->nullable();
            $table->string('email')->nullable();
            $table->ulid('image_media_id')->nullable();
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        // Now that citizen_profiles exists and wards/communities exist, add FKs.
        Schema::table('citizen_profiles', function (Blueprint $table) {
            $table->foreign('ward_id')->references('id')->on('wards')->nullOnDelete();
            $table->foreign('community_id')->references('id')->on('communities')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('citizen_profiles', function (Blueprint $table) {
            $table->dropForeign(['ward_id']);
            $table->dropForeign(['community_id']);
        });
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('communities');
        Schema::dropIfExists('wards');
        Schema::dropIfExists('staff');
        Schema::dropIfExists('departments');
    }
};
