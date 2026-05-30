<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('employee_code', 64)->nullable()->unique();
            $table->string('job_code', 120)->nullable();
            $table->enum('sex', ['male', 'female', 'other', 'unknown'])->default('unknown');
            $table->string('employment_status', 64)->nullable();
            $table->string('company', 120)->nullable();
            $table->string('department', 120)->nullable();
            $table->string('site_location', 120)->nullable();
            $table->string('supervisor_name', 120)->nullable();
            $table->string('birth_place', 120)->nullable();
            $table->date('birth_date')->nullable();
            $table->date('hire_date')->nullable();
            $table->date('contract_start_date')->nullable();
            $table->date('contract_end_date')->nullable();
            $table->text('address')->nullable();
            $table->string('emergency_contact_name', 120)->nullable();
            $table->string('emergency_contact_phone', 40)->nullable();
            $table->json('meta')->nullable();
            $table->timestamps();

            $table->index('job_code');
            $table->index('employment_status');
            $table->index('site_location');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
