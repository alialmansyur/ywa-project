<?php

namespace Database\Seeders;

use App\Models\WoProcessTemplate;
use Illuminate\Database\Seeder;

class WorkOrderProcessTemplateSeeder extends Seeder
{
    public function run(): void
    {
        $templates = [
            [
                'code' => 'WO-PREVENTIVE-V1',
                'name' => 'Workshop Preventive Standard',
                'wo_type' => 'preventive',
                'steps' => [
                    ['order' => 10, 'code' => 'RECEIVE_JOB', 'name' => 'Terima WO & Persiapan', 'sla' => 30],
                    ['order' => 20, 'code' => 'INSPECTION', 'name' => 'Inspection & Checklist Awal', 'sla' => 45],
                    ['order' => 30, 'code' => 'EXECUTION', 'name' => 'Pengerjaan Preventive', 'sla' => 180],
                    ['order' => 40, 'code' => 'QC', 'name' => 'QC / Review Supervisor', 'sla' => 45, 'approval' => true],
                    ['order' => 50, 'code' => 'CLOSE', 'name' => 'Close WO & Serah Unit', 'sla' => 30],
                ],
            ],
            [
                'code' => 'WO-CORRECTIVE-V1',
                'name' => 'Workshop Corrective Standard',
                'wo_type' => 'corrective',
                'steps' => [
                    ['order' => 10, 'code' => 'RECEIVE_JOB', 'name' => 'Terima WO & Diagnosa', 'sla' => 60],
                    ['order' => 20, 'code' => 'PLAN_REPAIR', 'name' => 'Rencana Perbaikan & Part', 'sla' => 60, 'approval' => true],
                    ['order' => 30, 'code' => 'EXECUTION', 'name' => 'Pengerjaan Corrective', 'sla' => 240],
                    ['order' => 40, 'code' => 'TEST_RUN', 'name' => 'Testing / Commissioning', 'sla' => 60],
                    ['order' => 50, 'code' => 'QC', 'name' => 'QC / Approval Supervisor', 'sla' => 45, 'approval' => true],
                    ['order' => 60, 'code' => 'CLOSE', 'name' => 'Close WO', 'sla' => 30],
                ],
            ],
            [
                'code' => 'WO-BREAKDOWN-V1',
                'name' => 'Workshop Breakdown Emergency',
                'wo_type' => 'breakdown',
                'steps' => [
                    ['order' => 10, 'code' => 'TRIAGE', 'name' => 'Emergency Triage', 'sla' => 20],
                    ['order' => 20, 'code' => 'ISOLATION', 'name' => 'Isolasi Unit & Safety Control', 'sla' => 20],
                    ['order' => 30, 'code' => 'REPAIR', 'name' => 'Perbaikan Darurat', 'sla' => 180],
                    ['order' => 40, 'code' => 'TEST_RUN', 'name' => 'Test Run Cepat', 'sla' => 40],
                    ['order' => 50, 'code' => 'APPROVAL', 'name' => 'Review Supervisor', 'sla' => 30, 'approval' => true],
                    ['order' => 60, 'code' => 'CLOSE', 'name' => 'Close Breakdown WO', 'sla' => 20],
                ],
            ],
            [
                'code' => 'WO-INSPECTION-V1',
                'name' => 'Workshop Inspection Follow-up',
                'wo_type' => 'inspection',
                'steps' => [
                    ['order' => 10, 'code' => 'RECEIVE_FINDING', 'name' => 'Terima Temuan Inspeksi', 'sla' => 30],
                    ['order' => 20, 'code' => 'VERIFY_FINDING', 'name' => 'Verifikasi Temuan', 'sla' => 45],
                    ['order' => 30, 'code' => 'ACTION', 'name' => 'Tindakan Perbaikan', 'sla' => 120],
                    ['order' => 40, 'code' => 'VALIDATION', 'name' => 'Validasi Hasil', 'sla' => 45, 'approval' => true],
                    ['order' => 50, 'code' => 'CLOSE', 'name' => 'Close WO Inspeksi', 'sla' => 20],
                ],
            ],
        ];

        foreach ($templates as $templateData) {
            $this->upsertTemplate($templateData);
        }

        $workshopBayTemplates = [
            ['code' => 'WO-WORKSHOP-BAY-PREVENTIVE-V1', 'name' => 'Workshop Bay Flow Preventive', 'wo_type' => 'preventive'],
            ['code' => 'WO-WORKSHOP-BAY-CORRECTIVE-V1', 'name' => 'Workshop Bay Flow Corrective', 'wo_type' => 'corrective'],
            ['code' => 'WO-WORKSHOP-BAY-BREAKDOWN-V1', 'name' => 'Workshop Bay Flow Breakdown', 'wo_type' => 'breakdown'],
            ['code' => 'WO-WORKSHOP-BAY-INSPECTION-V1', 'name' => 'Workshop Bay Flow Inspection', 'wo_type' => 'inspection'],
        ];

        foreach ($workshopBayTemplates as $templateData) {
            $this->upsertTemplate([
                'code' => $templateData['code'],
                'name' => $templateData['name'],
                'wo_type' => $templateData['wo_type'],
                'steps' => [
                    ['order' => 10, 'code' => 'REGISTRATION', 'name' => 'Registrasi Kedatangan', 'sla' => 15],
                    ['order' => 20, 'code' => 'APPROVAL', 'name' => 'Approval Kedatangan', 'sla' => 15, 'approval' => true],
                    ['order' => 30, 'code' => 'WASHING_BAY', 'name' => 'Cuci Unit', 'sla' => 30],
                    ['order' => 40, 'code' => 'INSPECTION_PKB', 'name' => 'Inspeksi Awal & Pembuatan PKB & Assign Kategori', 'sla' => 45],
                    ['order' => 50, 'code' => 'CHECKING', 'name' => 'Pengecekan Unit', 'sla' => 30],
                    ['order' => 60, 'code' => 'WAITING_BAY', 'name' => 'Antrian (Waiting Bay)', 'sla' => 60],
                    ['order' => 70, 'code' => 'CREATE_WO', 'name' => 'Pembuatan WO & Cetak Jobcard', 'sla' => 30],
                    ['order' => 80, 'code' => 'REPAIR', 'name' => 'Proses Perbaikan (Service/Repair Bay)', 'sla' => 180],
                    ['order' => 90, 'code' => 'QC', 'name' => 'QC Perbaikan', 'sla' => 45, 'approval' => true],
                    ['order' => 100, 'code' => 'READY_BAY_CLOSE', 'name' => 'Parkir Unit Ready & Closing Administrasi', 'sla' => 30],
                    ['order' => 110, 'code' => 'HANDOVER', 'name' => 'Serah Terima Unit', 'sla' => 15],
                ],
            ]);
        }

        $this->command?->info('Work order process templates seeded.');
    }

    private function upsertTemplate(array $templateData): void
    {
        $template = WoProcessTemplate::updateOrCreate(
            ['code' => $templateData['code']],
            [
                'name' => $templateData['name'],
                'wo_type' => $templateData['wo_type'],
                'is_active' => true,
            ]
        );

        foreach ($templateData['steps'] as $step) {
            $template->steps()->updateOrCreate(
                ['step_order' => $step['order']],
                [
                    'step_code' => $step['code'],
                    'step_name' => $step['name'],
                    'sla_minutes' => $step['sla'] ?? null,
                    'requires_approval' => (bool) ($step['approval'] ?? false),
                    'allow_parallel' => (bool) ($step['parallel'] ?? false),
                    'is_mandatory' => (bool) ($step['mandatory'] ?? true),
                ]
            );
        }
    }
}
