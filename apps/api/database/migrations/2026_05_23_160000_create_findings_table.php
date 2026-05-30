<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('findings', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
            $table->string('section', 120);
            $table->text('description');
            $table->enum('status', ['submitted', 'in_review', 'resolved'])->default('submitted');
            $table->string('photo_path')->nullable();
            $table->text('resolution_notes')->nullable();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['asset_id', 'status']);
            $table->index(['reporter_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('findings');
    }
};
