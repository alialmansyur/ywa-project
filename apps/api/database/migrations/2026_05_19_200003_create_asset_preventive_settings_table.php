<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_preventive_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->unique()->constrained('assets')->cascadeOnDelete();
            $table->enum('trigger_type', ['hm', 'km', 'calendar'])->default('hm');
            $table->decimal('alert_before_value', 10, 1)->default(25);
            $table->enum('escalation_target', ['planner', 'supervisor', 'planner_supervisor'])->default('planner_supervisor');
            $table->boolean('auto_create_work_order')->default(true);
            $table->json('notification_channels')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_preventive_settings');
    }
};
