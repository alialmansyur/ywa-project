<?php

namespace Database\Seeders;

use App\Models\WorkOrderStatusLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BackfillWorkOrderPreStepSeeder extends Seeder
{
    public function run(): void
    {
        $instances = DB::table('wo_process_instances')
            ->whereIn('state', ['running', 'hold'])
            ->orderBy('id')
            ->get();

        foreach ($instances as $instance) {
            $workOrder = DB::table('work_orders')->where('id', $instance->wo_id)->first();
            if (! $workOrder) {
                continue;
            }

            $registration = DB::table('wo_process_step_logs')
                ->where('process_instance_id', $instance->id)
                ->where('step_code', 'REGISTRATION')
                ->first();

            if ($registration && ! in_array((string) $registration->status, ['done', 'skipped'], true)) {
                DB::table('wo_process_step_logs')
                    ->where('id', $registration->id)
                    ->update([
                        'status' => 'done',
                        'process_in_at' => $registration->process_in_at ?: $workOrder->created_at,
                        'process_out_at' => $registration->process_out_at ?: $workOrder->created_at,
                        'actual_minutes' => $registration->actual_minutes ?: 1,
                        'performed_by' => $registration->performed_by ?: $workOrder->created_by,
                        'notes' => $registration->notes ?: 'Backfill auto-complete dari registrasi kedatangan.',
                        'updated_at' => now(),
                    ]);
            }

            $approval = DB::table('wo_process_step_logs')
                ->where('process_instance_id', $instance->id)
                ->where('step_code', 'APPROVAL')
                ->first();

            if (
                $approval
                && in_array((string) $workOrder->status, ['triage', 'approved', 'pending', 'in_progress', 'on_hold', 'completed'], true)
                && ! in_array((string) $approval->status, ['done', 'skipped'], true)
            ) {
                $approvalLog = WorkOrderStatusLog::query()
                    ->where('wo_id', $workOrder->id)
                    ->whereIn('to_status', ['triage', 'approved'])
                    ->orderBy('changed_at')
                    ->first();

                DB::table('wo_process_step_logs')
                    ->where('id', $approval->id)
                    ->update([
                        'status' => 'done',
                        'process_in_at' => $approval->process_in_at ?: ($approvalLog?->changed_at ?: now()),
                        'process_out_at' => $approval->process_out_at ?: ($approvalLog?->changed_at ?: now()),
                        'actual_minutes' => $approval->actual_minutes ?: 1,
                        'performed_by' => $approval->performed_by ?: ($approvalLog?->changed_by ?: $workOrder->created_by),
                        'approved_by' => $approval->approved_by ?: ($approvalLog?->changed_by ?: $workOrder->created_by),
                        'notes' => $approval->notes ?: 'Backfill auto-complete dari triage/approval kedatangan.',
                        'updated_at' => now(),
                    ]);
            }

            $nextReady = DB::table('wo_process_step_logs')
                ->where('process_instance_id', $instance->id)
                ->where('status', 'ready')
                ->orderBy('step_order')
                ->first();

            if ($nextReady && (int) $instance->current_step_order !== (int) $nextReady->step_order) {
                DB::table('wo_process_instances')
                    ->where('id', $instance->id)
                    ->update([
                        'current_step_order' => $nextReady->step_order,
                        'updated_at' => now(),
                    ]);
            }
        }
    }
}
