<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wo_process_step_logs', function (Blueprint $table) {
            $table->enum('bay_in', ['washing_bay', 'waiting_bay', 'service_bay', 'qc_bay', 'ready_bay'])
                ->nullable()
                ->after('notes');
            $table->timestamp('bay_in_at')->nullable()->after('bay_in');
            $table->timestamp('bay_out_at')->nullable()->after('bay_in_at');
            $table->unsignedInteger('queue_minutes')->nullable()->after('bay_out_at');
            $table->unsignedInteger('rework_count')->default(0)->after('queue_minutes');

            $table->index(['wo_id', 'bay_in']);
        });
    }

    public function down(): void
    {
        Schema::table('wo_process_step_logs', function (Blueprint $table) {
            $table->dropIndex('wo_process_step_logs_wo_id_bay_in_index');
            $table->dropColumn(['bay_in', 'bay_in_at', 'bay_out_at', 'queue_minutes', 'rework_count']);
        });
    }
};
