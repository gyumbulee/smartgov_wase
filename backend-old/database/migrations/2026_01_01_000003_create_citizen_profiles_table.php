<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('citizen_profiles', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignUlid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('citizen_reference', 30)->unique();
            $table->string('first_name', 100);
            $table->string('middle_name', 100)->nullable();
            $table->string('last_name', 100);
            $table->date('date_of_birth')->nullable();
            $table->enum('gender', ['male', 'female', 'other', 'undisclosed'])->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('state_of_origin', 100)->nullable();
            $table->string('lga_of_origin', 100)->nullable();
            $table->ulid('ward_id')->nullable();
            $table->ulid('community_id')->nullable();
            $table->enum('identity_status', ['unverified', 'verified', 'failed'])->default('unverified');
            $table->enum('eligibility_status', ['unknown', 'verified', 'pending', 'rejected'])->default('unknown');
            $table->timestamp('profile_completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('ward_id');
            $table->index('community_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('citizen_profiles');
    }
};
