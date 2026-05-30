<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maintenance_schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['preventive', 'periodic', 'conditional']);
            $table->string('name');
            $table->decimal('interval_hm', 10, 1)->nullable();
            $table->decimal('interval_km', 10, 1)->nullable();
            $table->decimal('last_done_hm', 10, 1)->nullable();
            $table->decimal('last_done_km', 10, 1)->nullable();
            $table->timestamp('last_done_at')->nullable();
            $table->timestamp('next_due_at')->nullable();
            $table->decimal('next_due_hm', 10, 1)->nullable();
            $table->decimal('next_due_km', 10, 1)->nullable();
            $table->enum('status', ['scheduled', 'due', 'overdue', 'completed'])->default('scheduled');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maintenance_schedules');
    }
};
