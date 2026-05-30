<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ApprovalTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $now = now();
        $users = DB::table('users')->pluck('id')->values();

        if ($users->count() < 3) {
            $this->command?->warn('ApprovalTemplateSeeder skipped: minimal butuh 3 user.');
            return;
        }

        $templateDefs = [
            [
                'code' => 'APR-FINDING-CREATE',
                'name' => 'Approval Temuan Aset',
                'module_code' => 'mobile',
                'route_key' => 'mobile.findings.create',
                'target_model_type' => 'App\\Models\\Finding',
                'target_action' => 'create',
                'approval_mode' => 'single',
                'min_approvals_total' => 1,
                'step' => ['step_name' => 'Review Supervisor', 'min_approvals_required' => 1],
            ],
            [
                'code' => 'APR-BREAKDOWN-CREATE',
                'name' => 'Approval Laporan Breakdown',
                'module_code' => 'mobile',
                'route_key' => 'mobile.breakdown-reports.create',
                'target_model_type' => 'App\\Models\\BreakdownReport',
                'target_action' => 'create',
                'approval_mode' => 'parallel',
                'min_approvals_total' => 2,
                'step' => ['step_name' => 'Review Safety & Supervisor', 'min_approvals_required' => 2],
            ],
            [
                'code' => 'APR-WORKSHOP-REGISTER',
                'name' => 'Approval Registrasi Workshop',
                'module_code' => 'mobile',
                'route_key' => 'mobile.workshop.register',
                'target_model_type' => 'App\\Models\\WorkOrder',
                'target_action' => 'create',
                'approval_mode' => 'sequential',
                'min_approvals_total' => 2,
                'step' => ['step_name' => 'Supervisor Approval', 'min_approvals_required' => 1],
                'step2' => ['step_name' => 'Planner Approval', 'min_approvals_required' => 1],
            ],
            [
                'code' => 'APR-INVENTORY-OUT',
                'name' => 'Approval Pengeluaran Spare Part',
                'module_code' => 'admin',
                'route_key' => 'admin.inventory.transactions.out',
                'target_model_type' => 'App\\Models\\InventoryTransaction',
                'target_action' => 'create',
                'approval_mode' => 'single',
                'min_approvals_total' => 1,
                'step' => ['step_name' => 'Warehouse Approval', 'min_approvals_required' => 1],
            ],
            [
                'code' => 'APR-SCHEDULE-WO-CREATE',
                'name' => 'Approval Generate WO dari Schedule',
                'module_code' => 'admin',
                'route_key' => 'admin.schedule.create-work-order',
                'target_model_type' => 'App\\Models\\WorkOrder',
                'target_action' => 'create',
                'approval_mode' => 'single',
                'min_approvals_total' => 1,
                'step' => ['step_name' => 'Maintenance Planner Approval', 'min_approvals_required' => 1],
            ],
        ];

        foreach ($templateDefs as $i => $def) {
            DB::table('approval_templates')->updateOrInsert(
                ['code' => $def['code']],
                [
                    'name' => $def['name'],
                    'module_code' => $def['module_code'],
                    'route_key' => $def['route_key'],
                    'target_model_type' => $def['target_model_type'],
                    'target_action' => $def['target_action'],
                    'approval_mode' => $def['approval_mode'],
                    'min_approvals_total' => $def['min_approvals_total'],
                    'is_active' => true,
                    'effective_from' => $now,
                    'effective_until' => null,
                    'auto_approve_outside_window' => true,
                    'conditions_json' => null,
                    'notes' => 'Seeded template.',
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );

            $templateId = DB::table('approval_templates')->where('code', $def['code'])->value('id');

            DB::table('approval_template_steps')->updateOrInsert(
                ['template_id' => $templateId, 'step_order' => 1],
                [
                    'step_name' => $def['step']['step_name'],
                    'assignment_mode' => 'fixed_users',
                    'min_approvals_required' => $def['step']['min_approvals_required'],
                    'allow_self_approval' => false,
                    'sla_hours' => 24,
                    'is_active' => true,
                    'conditions_json' => null,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );

            if (isset($def['step2'])) {
                DB::table('approval_template_steps')->updateOrInsert(
                    ['template_id' => $templateId, 'step_order' => 2],
                    [
                        'step_name' => $def['step2']['step_name'],
                        'assignment_mode' => 'fixed_users',
                        'min_approvals_required' => $def['step2']['min_approvals_required'],
                        'allow_self_approval' => false,
                        'sla_hours' => 24,
                        'is_active' => true,
                        'conditions_json' => null,
                        'updated_at' => $now,
                        'created_at' => $now,
                    ]
                );
            }

            $steps = DB::table('approval_template_steps')
                ->where('template_id', $templateId)
                ->orderBy('step_order')
                ->get();

            foreach ($steps as $step) {
                DB::table('approval_template_step_users')
                    ->where('template_step_id', $step->id)
                    ->delete();

                // Assign sample users; actual user selection later managed in admin.
                $candidateUsers = $users->slice($i % max(1, $users->count() - 2), 3)->values();
                if ($candidateUsers->count() < 3) {
                    $candidateUsers = $users->take(3);
                }

                foreach ($candidateUsers as $userId) {
                    DB::table('approval_template_step_users')->insert([
                        'template_step_id' => $step->id,
                        'user_id' => $userId,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ]);
                }
            }
        }

        $this->command?->info('Approval templates seeded.');
    }
}
