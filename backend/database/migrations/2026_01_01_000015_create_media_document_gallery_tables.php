<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('media', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('disk')->default('local');
            $table->string('path');
            $table->string('filename');
            $table->string('original_filename')->nullable();
            $table->string('mime_type')->nullable();
            $table->string('extension', 10)->nullable();
            $table->unsignedBigInteger('size')->nullable();
            $table->unsignedInteger('width')->nullable();
            $table->unsignedInteger('height')->nullable();
            $table->string('alt_text')->nullable();
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->string('credit')->nullable();
            $table->string('copyright')->nullable();
            $table->string('license')->nullable();
            $table->foreignUlid('uploaded_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('mediables', function (Blueprint $table) {
            $table->foreignUlid('media_id')->constrained('media')->cascadeOnDelete();
            $table->string('mediable_type');
            $table->ulid('mediable_id');
            $table->string('collection')->default('gallery');
            $table->integer('sort_order')->default(0);

            $table->index(['mediable_type', 'mediable_id']);
        });

        Schema::create('galleries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category')->nullable();
            $table->ulid('featured_image_id')->nullable();
            $table->enum('status', ['draft', 'published'])->default('draft');
            $table->timestamps();
        });

        Schema::create('gallery_media', function (Blueprint $table) {
            $table->foreignUlid('gallery_id')->constrained('galleries')->cascadeOnDelete();
            $table->foreignUlid('media_id')->constrained('media')->cascadeOnDelete();
            $table->integer('sort_order')->default(0);
            $table->string('caption')->nullable();

            $table->primary(['gallery_id', 'media_id']);
        });

        Schema::create('document_categories', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->string('title');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->foreignUlid('category_id')->nullable()->constrained('document_categories')->nullOnDelete();
            $table->foreignUlid('file_media_id')->nullable()->constrained('media')->nullOnDelete();
            $table->string('version')->nullable();
            $table->boolean('is_public')->default(true);
            $table->timestamp('published_at')->nullable();
            $table->foreignUlid('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('document_categories');
        Schema::dropIfExists('gallery_media');
        Schema::dropIfExists('galleries');
        Schema::dropIfExists('mediables');
        Schema::dropIfExists('media');
    }
};
