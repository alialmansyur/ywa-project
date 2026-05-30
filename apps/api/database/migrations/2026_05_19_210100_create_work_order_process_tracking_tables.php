<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wo_process_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->enum('wo_type', ['preventive', 'corrective', 'breakdown', 'inspection']);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['wo_type', 'is_active']);
        });

        Schema::create('wo_process_template_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('wo_process_templates')->cascadeOnDelete();
            $table->unsignedInteger('step_order');
            $table->string('step_code');
            $table->string('step_name');
            $table->unsignedInteger('sla_minutes')->nullable();
            $table->boolean('requires_approval')->default(false);
            $table->boolean('allow_parallel')->default(false);
            $table->boolean('is_mandatory')->default(true);
            $table->timestamps();

            $table->unique(['template_id', 'step_order']);
            $table->unique(['template_id', 'step_code']);
        });

        Schema::create('wo_process_instances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('wo_process_templates')->restrictOnDelete();
            $table->unsignedInteger('current_step_order')->nullable();
            $table->enum('state', ['not_started', 'running', 'hold', 'done', 'cancelled'])->default('not_started');
            $table->timestamps();

            $table->index(['wo_id', 'state']);
        });

        Schema::create('wo_process_step_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('process_instance_id')->constrained('wo_process_instances')->cascadeOnDelete();
            $table->foreignId('template_step_id')->nullable()->constrained('wo_process_template_steps')->nullOnDelete();
            $table->unsignedInteger('step_order');
            $table->string('step_code');
            $table->string('step_name');
            $table->enum('status', ['ready', 'in_progress', 'waiting_approval', 'done', 'rejected', 'skipped', 'hold'])->default('ready');
            $table->timestamp('process_in_at')->nullable();
            $table->timestamp('process_out_at')->nullable();
            $table->unsignedInteger('est_minutes')->nullable();
            $table->unsignedInteger('actual_minutes')->nullable();
            $table->unsignedInteger('downtime_minutes')->nullable();
            $table->foreignId('performed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->text('reject_reason')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['wo_id', 'step_order']);
            $table->index(['process_instance_id', 'status']);
        });

        Schema::create('wo_process_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('event_key');
            $table->unsignedInteger('source_step_order')->nullable();
            $table->unsignedInteger('target_step_order')->nullable();
            $table->foreignId('triggered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->json('payload_json')->nullable();
            $table->timestamp('triggered_at')->useCurrent();
            $table->timestamps();

            $table->index(['wo_id', 'triggered_at']);
            $table->index('event_key');
        });

        Schema::table('work_orders', function (Blueprint $table) {
            $table->foreignId('process_template_id')
                ->nullable()
                ->after('status')
                ->constrained('wo_process_templates')
                ->nullOnDelete();
            $table->boolean('is_process_tracking_enabled')
                ->default(true)
                ->after('process_template_id');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropConstrainedForeignId('process_template_id');
            $table->dropColumn('is_process_tracking_enabled');
        });

        Schema::dropIfExists('wo_process_events');
        Schema::dropIfExists('wo_process_step_logs');
        Schema::dropIfExists('wo_process_instances');
        Schema::dropIfExists('wo_process_template_steps');
        Schema::dropIfExists('wo_process_templates');
    }
};
