<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wo_process_abnormalities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('process_instance_id')->nullable()->constrained('wo_process_instances')->nullOnDelete();
            $table->foreignId('step_log_id')->nullable()->constrained('wo_process_step_logs')->nullOnDelete();
            $table->string('category');
            $table->enum('severity', ['low', 'medium', 'high', 'critical'])->default('medium');
            $table->enum('status', ['open', 'resolved'])->default('open');
            $table->string('summary');
            $table->json('details_json')->nullable();
            $table->foreignId('reported_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();

            $table->index(['wo_id', 'status']);
            $table->index(['category', 'severity']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wo_process_abnormalities');
    }
};
