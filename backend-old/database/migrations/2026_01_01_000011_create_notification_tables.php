<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('type');
            $table->string('title');
            $table->text('message');
            $table->json('data')->nullable();
            $table->enum('channel', ['database', 'email', 'sms'])->default('database');
            $table->string('status')->default('pending');
            $table->timestamp('read_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();

            $table->index('user_id');
            $table->index('read_at');
        });

        Schema::create('notification_preferences', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->boolean('application_updates')->default(true);
            $table->boolean('payment_updates')->default(true);
            $table->boolean('certificate_updates')->default(true);
            $table->boolean('news')->default(true);
            $table->boolean('announcements')->default(true);
            $table->boolean('email_enabled')->default(true);
            $table->boolean('sms_enabled')->default(false);
            $table->timestamps();

            $table->unique('user_id');
        });

        Schema::create('notification_deliveries', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('notification_id')->constrained('notifications')->cascadeOnDelete();
            $table->enum('channel', ['database', 'email', 'sms']);
            $table->string('provider')->nullable();
            $table->string('provider_reference')->nullable();
            $table->string('status');
            $table->json('response')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notification_deliveries');
        Schema::dropIfExists('notification_preferences');
        Schema::dropIfExists('notifications');
    }
};
