<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('approval_templates', function (Blueprint $table) {
            $table->id();
            $table->string('code', 80)->unique();
            $table->string('name', 150);
            $table->string('module_code', 80)->nullable()->index();
            $table->string('route_key', 150)->index();
            $table->string('target_model_type', 150)->nullable();
            $table->string('target_action', 50)->default('create');
            $table->enum('approval_mode', ['single', 'parallel', 'sequential'])->default('single');
            $table->unsignedSmallInteger('min_approvals_total')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamp('effective_from')->nullable()->index();
            $table->timestamp('effective_until')->nullable()->index();
            $table->boolean('auto_approve_outside_window')->default(true);
            $table->json('conditions_json')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('approval_template_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('approval_templates')->cascadeOnDelete();
            $table->unsignedSmallInteger('step_order')->default(1);
            $table->string('step_name', 150);
            $table->enum('assignment_mode', ['fixed_users', 'manual_users'])->default('fixed_users');
            $table->unsignedSmallInteger('min_approvals_required')->default(1);
            $table->boolean('allow_self_approval')->default(false);
            $table->unsignedInteger('sla_hours')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('conditions_json')->nullable();
            $table->timestamps();

            $table->unique(['template_id', 'step_order']);
        });

        Schema::create('approval_template_step_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_step_id')->constrained('approval_template_steps')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['template_step_id', 'user_id']);
        });

        Schema::create('approval_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('template_id')->constrained('approval_templates')->restrictOnDelete();
            $table->string('reference_type', 150)->index();
            $table->unsignedBigInteger('reference_id')->index();
            $table->string('route_key', 150)->index();
            $table->foreignId('submitted_by')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled', 'skipped'])->default('pending')->index();
            $table->unsignedSmallInteger('current_step_order')->nullable();
            $table->unsignedSmallInteger('required_approvals_total')->default(1);
            $table->unsignedSmallInteger('approved_count')->default(0);
            $table->unsignedSmallInteger('rejected_count')->default(0);
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->json('snapshot_json')->nullable();
            $table->json('metadata_json')->nullable();
            $table->text('decision_notes')->nullable();
            $table->timestamps();

            $table->index(['reference_type', 'reference_id', 'status'], 'approval_reference_status_idx');
        });

        Schema::create('approval_request_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_request_id')->constrained('approval_requests')->cascadeOnDelete();
            $table->foreignId('template_step_id')->nullable()->constrained('approval_template_steps')->nullOnDelete();
            $table->unsignedSmallInteger('step_order')->default(1);
            $table->string('step_name', 150);
            $table->enum('status', ['pending', 'approved', 'rejected', 'skipped'])->default('pending')->index();
            $table->unsignedSmallInteger('min_approvals_required')->default(1);
            $table->unsignedSmallInteger('approved_count')->default(0);
            $table->unsignedSmallInteger('rejected_count')->default(0);
            $table->timestamp('started_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->json('approver_snapshot_json')->nullable();
            $table->text('decision_notes')->nullable();
            $table->timestamps();

            $table->unique(['approval_request_id', 'step_order'], 'approval_request_step_order_unique');
        });

        Schema::create('approval_decisions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('approval_request_id')->constrained('approval_requests')->cascadeOnDelete();
            $table->foreignId('approval_request_step_id')->constrained('approval_request_steps')->cascadeOnDelete();
            $table->foreignId('approver_user_id')->constrained('users')->restrictOnDelete();
            $table->enum('decision', ['approved', 'rejected', 'revision_requested'])->index();
            $table->text('notes')->nullable();
            $table->timestamp('decided_at')->nullable();
            $table->json('metadata_json')->nullable();
            $table->timestamps();

            $table->unique(['approval_request_step_id', 'approver_user_id'], 'approval_step_user_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('approval_decisions');
        Schema::dropIfExists('approval_request_steps');
        Schema::dropIfExists('approval_requests');
        Schema::dropIfExists('approval_template_step_users');
        Schema::dropIfExists('approval_template_steps');
        Schema::dropIfExists('approval_templates');
    }
};
