<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('work_order_assignees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->enum('role', ['lead', 'member', 'support'])->default('member');
            $table->timestamps();

            $table->unique(['wo_id', 'user_id']);
        });

        Schema::create('work_order_checklists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('item');
            $table->boolean('is_done')->default(false);
            $table->foreignId('done_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('done_at')->nullable();
            $table->timestamps();
        });

        Schema::create('work_order_attachments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('file_name');
            $table->enum('type', ['photo', 'document', 'video', 'other'])->default('photo');
            $table->foreignId('uploaded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();
        });

        Schema::create('work_order_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->text('message');
            $table->timestamps();
        });

        Schema::create('work_order_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->string('from_status')->nullable();
            $table->string('to_status');
            $table->foreignId('changed_by')->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('changed_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('work_order_status_logs');
        Schema::dropIfExists('work_order_comments');
        Schema::dropIfExists('work_order_attachments');
        Schema::dropIfExists('work_order_checklists');
        Schema::dropIfExists('work_order_assignees');
    }
};
