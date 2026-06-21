<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::transaction(function () {
            $workshopTemplateIds = DB::table('wo_process_templates')
                ->where('code', 'like', 'WO-WORKSHOP-BAY-%')
                ->pluck('id');

            if ($workshopTemplateIds->isEmpty()) {
                return;
            }

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_code', 'CREATE_WO')
                ->update(['step_order' => 600]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_code', 'WAITING_BAY')
                ->update(['step_order' => 700]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_order', 600)
                ->update(['step_order' => 60]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_order', 700)
                ->update(['step_order' => 70]);

            $workshopWoIds = DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->pluck('wo_id');

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_code', 'CREATE_WO')
                ->update(['step_order' => 600]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_code', 'WAITING_BAY')
                ->update(['step_order' => 700]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_order', 600)
                ->update(['step_order' => 60]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_order', 700)
                ->update(['step_order' => 70]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 60)
                ->update(['current_step_order' => 600]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 70)
                ->update(['current_step_order' => 700]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 600)
                ->update(['current_step_order' => 60]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 700)
                ->update(['current_step_order' => 70]);

            if ($workshopWoIds->isNotEmpty()) {
                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 60)
                    ->update(['source_step_order' => 600]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 70)
                    ->update(['source_step_order' => 700]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 60)
                    ->update(['target_step_order' => 600]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 70)
                    ->update(['target_step_order' => 700]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 600)
                    ->update(['source_step_order' => 60]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 700)
                    ->update(['source_step_order' => 70]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 600)
                    ->update(['target_step_order' => 60]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 700)
                    ->update(['target_step_order' => 70]);
            }
        });
    }

    public function down(): void
    {
        DB::transaction(function () {
            $workshopTemplateIds = DB::table('wo_process_templates')
                ->where('code', 'like', 'WO-WORKSHOP-BAY-%')
                ->pluck('id');

            if ($workshopTemplateIds->isEmpty()) {
                return;
            }

            $workshopWoIds = DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->pluck('wo_id');

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_code', 'WAITING_BAY')
                ->update(['step_order' => 600]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_code', 'CREATE_WO')
                ->update(['step_order' => 700]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_order', 600)
                ->update(['step_order' => 60]);

            DB::table('wo_process_template_steps')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('step_order', 700)
                ->update(['step_order' => 70]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_code', 'WAITING_BAY')
                ->update(['step_order' => 600]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_code', 'CREATE_WO')
                ->update(['step_order' => 700]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_order', 600)
                ->update(['step_order' => 60]);

            DB::table('wo_process_step_logs')
                ->whereIn('process_instance_id', function ($query) use ($workshopTemplateIds) {
                    $query->select('id')
                        ->from('wo_process_instances')
                        ->whereIn('template_id', $workshopTemplateIds);
                })
                ->where('step_order', 700)
                ->update(['step_order' => 70]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 60)
                ->update(['current_step_order' => 600]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 70)
                ->update(['current_step_order' => 700]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 600)
                ->update(['current_step_order' => 60]);

            DB::table('wo_process_instances')
                ->whereIn('template_id', $workshopTemplateIds)
                ->where('current_step_order', 700)
                ->update(['current_step_order' => 70]);

            if ($workshopWoIds->isNotEmpty()) {
                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 60)
                    ->update(['source_step_order' => 600]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 70)
                    ->update(['source_step_order' => 700]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 60)
                    ->update(['target_step_order' => 600]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 70)
                    ->update(['target_step_order' => 700]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 600)
                    ->update(['source_step_order' => 60]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('source_step_order', 700)
                    ->update(['source_step_order' => 70]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 600)
                    ->update(['target_step_order' => 60]);

                DB::table('wo_process_events')
                    ->whereIn('wo_id', $workshopWoIds)
                    ->where('target_step_order', 700)
                    ->update(['target_step_order' => 70]);
            }
        });
    }
};
