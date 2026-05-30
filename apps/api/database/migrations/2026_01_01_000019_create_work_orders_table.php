<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_orders', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->foreignId('asset_id')->constrained()->restrictOnDelete();
            $table->enum('type', ['preventive', 'corrective', 'breakdown', 'inspection']);
            $table->enum('priority', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->string('title');
            $table->text('description')->nullable();
            $table->enum('status', [
                'draft', 'pending', 'approved', 'in_progress',
                'on_hold', 'completed', 'cancelled'
            ])->default('draft');
            $table->foreignId('supervisor_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('created_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scheduled_start')->nullable();
            $table->timestamp('scheduled_end')->nullable();
            $table->timestamp('actual_start')->nullable();
            $table->timestamp('actual_end')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->decimal('estimated_cost', 15, 2)->nullable();
            $table->decimal('actual_cost', 15, 2)->nullable();
            $table->text('completion_notes')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['asset_id', 'status']);
            $table->index(['supervisor_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_orders');
    }
};
