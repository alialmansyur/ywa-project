<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Update ENUM for work_orders status safely using raw SQL
        \Illuminate\Support\Facades\DB::statement("
            ALTER TABLE work_orders 
            MODIFY COLUMN status ENUM(
                'draft', 'registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'
            ) DEFAULT 'draft'
        ");

        Schema::create('wo_process_step_downtimes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_process_step_log_id')->constrained('wo_process_step_logs')->cascadeOnDelete();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->timestamp('hold_start_at');
            $table->timestamp('hold_end_at')->nullable();
            $table->integer('duration_minutes')->default(0);
            $table->text('reason')->nullable();
            $table->foreignId('held_by')->constrained('users')->restrictOnDelete();
            $table->foreignId('resumed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            
            $table->index(['wo_id', 'hold_start_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wo_process_step_downtimes');

        // Rollback ENUM status
        \Illuminate\Support\Facades\DB::statement("
            ALTER TABLE work_orders 
            MODIFY COLUMN status ENUM(
                'draft', 'pending', 'approved', 'in_progress', 'on_hold', 'completed', 'cancelled'
            ) DEFAULT 'draft'
        ");
    }
};
