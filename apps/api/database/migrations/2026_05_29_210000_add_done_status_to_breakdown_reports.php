<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::dropIfExists('breakdown_reports');

            Schema::create('breakdown_reports', function (Blueprint $table) {
                $table->id();
                $table->string('report_no', 50)->unique();
                $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
                $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
                $table->string('location_label', 255)->nullable();
                $table->text('description');
                $table->enum('status', ['submitted', 'in_review', 'processed', 'done', 'cancelled'])->default('submitted');
                $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
                $table->timestamps();

                $table->index(['asset_id', 'created_at']);
                $table->index(['reporter_id', 'status']);
            });
        } else {
            DB::statement("\n            ALTER TABLE breakdown_reports\n            MODIFY COLUMN status ENUM('submitted', 'in_review', 'processed', 'done', 'cancelled')\n            DEFAULT 'submitted'\n        ");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::dropIfExists('breakdown_reports');

            Schema::create('breakdown_reports', function (Blueprint $table) {
                $table->id();
                $table->string('report_no', 50)->unique();
                $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
                $table->foreignId('reporter_id')->constrained('users')->cascadeOnDelete();
                $table->string('location_label', 255)->nullable();
                $table->text('description');
                $table->enum('status', ['submitted', 'in_review', 'processed', 'cancelled'])->default('submitted');
                $table->foreignId('work_order_id')->nullable()->constrained('work_orders')->nullOnDelete();
                $table->timestamps();

                $table->index(['asset_id', 'created_at']);
                $table->index(['reporter_id', 'status']);
            });
        } else {
            DB::statement("\n            ALTER TABLE breakdown_reports\n            MODIFY COLUMN status ENUM('submitted', 'in_review', 'processed', 'cancelled')\n            DEFAULT 'submitted'\n        ");
        }
    }
};
