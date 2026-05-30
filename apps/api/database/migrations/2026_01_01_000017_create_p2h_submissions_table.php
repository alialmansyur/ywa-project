<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('p2h_submissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->restrictOnDelete();
            $table->foreignId('operator_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('template_id')->constrained('p2h_templates')->restrictOnDelete();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['draft', 'submitted', 'approved', 'rejected'])->default('draft');
            $table->decimal('geolat', 10, 8)->nullable();
            $table->decimal('geolng', 11, 8)->nullable();
            $table->string('signature_url')->nullable();
            $table->text('review_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['asset_id', 'created_at']);
            $table->index(['operator_id', 'created_at']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2h_submissions');
    }
};
