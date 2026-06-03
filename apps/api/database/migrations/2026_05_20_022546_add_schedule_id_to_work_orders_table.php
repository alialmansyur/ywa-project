<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->foreignId('schedule_id')
                ->nullable()
                ->after('asset_id')
                ->constrained('maintenance_schedules')
                ->nullOnDelete();

            $table->index(['schedule_id', 'status']);
        });

        // Backfill ringan: pasangkan WO preventive lama berdasarkan asset + due date.
        if (DB::getDriverName() === 'sqlite') {
            $matches = DB::table('work_orders')
                ->join('maintenance_schedules', function ($join) {
                    $join->on('maintenance_schedules.asset_id', '=', 'work_orders.asset_id')
                        ->whereNotNull('maintenance_schedules.next_due_at')
                        ->whereNotNull('work_orders.scheduled_start');
                })
                ->whereNull('work_orders.schedule_id')
                ->where('work_orders.type', 'preventive')
                ->select([
                    'work_orders.id as work_order_id',
                    'maintenance_schedules.id as schedule_id',
                    'maintenance_schedules.next_due_at',
                    'work_orders.scheduled_start',
                ])
                ->get()
                ->filter(function ($row) {
                    return Carbon::parse($row->next_due_at)->toDateString() === Carbon::parse($row->scheduled_start)->toDateString();
                });

            foreach ($matches as $match) {
                DB::table('work_orders')
                    ->where('id', $match->work_order_id)
                    ->update(['schedule_id' => $match->schedule_id]);
            }
        } else {
            DB::statement("
                UPDATE work_orders wo
                INNER JOIN maintenance_schedules ms
                    ON ms.asset_id = wo.asset_id
                   AND ms.next_due_at IS NOT NULL
                   AND wo.scheduled_start IS NOT NULL
                   AND DATE(ms.next_due_at) = DATE(wo.scheduled_start)
                SET wo.schedule_id = ms.id
                WHERE wo.schedule_id IS NULL
                  AND wo.type = 'preventive'
            ");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropIndex(['schedule_id', 'status']);
            $table->dropConstrainedForeignId('schedule_id');
        });
    }
};
