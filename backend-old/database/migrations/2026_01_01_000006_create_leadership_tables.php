<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leadership_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('position');
            $table->foreignUlid('department_id')->nullable()->constrained('departments')->nullOnDelete();
            $table->longText('biography')->nullable();
            $table->text('short_bio')->nullable();
            $table->ulid('photo_media_id')->nullable();
            $table->string('email')->nullable();
            $table->string('phone', 30)->nullable();
            $table->integer('display_order')->default(0);
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('leadership_terms', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('leadership_profile_id')->constrained('leadership_profiles')->cascadeOnDelete();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leadership_terms');
        Schema::dropIfExists('leadership_profiles');
    }
};
