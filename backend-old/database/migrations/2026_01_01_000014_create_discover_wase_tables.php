<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tourism_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('icon')->nullable();
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        Schema::create('tourist_attractions', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignUlid('category_id')->nullable()->constrained('tourism_categories')->nullOnDelete();
            $table->string('short_description')->nullable();
            $table->longText('description')->nullable();
            $table->longText('history')->nullable();
            $table->longText('cultural_significance')->nullable();
            $table->string('location_description')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->text('directions')->nullable();
            $table->text('visitor_information')->nullable();
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('historical_records', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('period_start')->nullable();
            $table->string('period_end')->nullable();
            $table->string('period_label')->nullable();
            $table->text('summary')->nullable();
            $table->longText('content');
            $table->string('location')->nullable();
            $table->json('sources')->nullable();
            $table->boolean('featured')->default(false);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('notable_people_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('notable_people', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('short_description')->nullable();
            $table->longText('biography');
            $table->date('date_of_birth')->nullable();
            $table->date('date_of_death')->nullable();
            $table->foreignUlid('category_id')->nullable()->constrained('notable_people_categories')->nullOnDelete();
            $table->foreignUlid('community_id')->nullable()->constrained('communities')->nullOnDelete();
            $table->foreignUlid('ward_id')->nullable()->constrained('wards')->nullOnDelete();
            $table->ulid('photo_media_id')->nullable();
            $table->text('achievements')->nullable();
            $table->text('contribution')->nullable();
            $table->text('legacy')->nullable();
            $table->json('sources')->nullable();
            $table->enum('status', ['draft', 'review', 'published', 'archived'])->default('draft');
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notable_people');
        Schema::dropIfExists('notable_people_categories');
        Schema::dropIfExists('historical_records');
        Schema::dropIfExists('tourist_attractions');
        Schema::dropIfExists('tourism_categories');
    }
};
