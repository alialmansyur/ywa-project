<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\SparePart;
use App\Models\Inventory;
use App\Models\User;
use App\Models\WorkOrder;
use App\Models\WorkOrderStatusLog;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class WorkOrderSeeder extends Seeder
{
    public function run(): void
    {
        $supervisor = User::where('email', 'supervisor@tapg.local')->first();
        $mechanic   = User::where('email', 'mechanic@tapg.local')->first();
        $admin      = User::where('email', 'admin@tapg.local')->first();

        $asset1 = Asset::where('code', 'EXC-001')->first();
        $asset2 = Asset::where('code', 'BLD-001')->first();
        $asset3 = Asset::where('code', 'GRD-001')->first();

        // Work Order 1: In Progress
        if ($asset1 && $supervisor && $mechanic) {
            $wo1 = WorkOrder::create([
                'code'            => 'WO-' . now()->format('Ymd') . '-00001',
                'asset_id'        => $asset1->id,
                'type'            => 'preventive',
                'priority'        => 'medium',
                'title'           => 'Service 250 HM Excavator CAT 320',
                'description'     => 'Ganti oli mesin, filter oli, filter bahan bakar. Cek kondisi hidrolik.',
                'status'          => 'in_progress',
                'supervisor_id'   => $supervisor->id,
                'created_by'      => $admin->id,
                'approved_by'     => $supervisor->id,
                'scheduled_start' => now()->subDays(1),
                'scheduled_end'   => now()->addDays(1),
                'actual_start'    => now()->subHours(3),
                'estimated_cost'  => 2500000,
                'approved_at'     => now()->subDays(1),
            ]);

            $wo1->assignees()->attach($mechanic->id, ['role' => 'lead']);

            $wo1->checklists()->createMany([
                ['item' => 'Drain oli mesin lama', 'is_done' => true, 'done_by' => $mechanic->id, 'done_at' => now()->subHours(2)],
                ['item' => 'Pasang filter oli baru', 'is_done' => true, 'done_by' => $mechanic->id, 'done_at' => now()->subHours(2)],
                ['item' => 'Isi oli mesin baru 15L', 'is_done' => false],
                ['item' => 'Ganti filter bahan bakar', 'is_done' => false],
                ['item' => 'Test run 30 menit', 'is_done' => false],
            ]);

            WorkOrderStatusLog::create([
                'wo_id' => $wo1->id, 'from_status' => null, 'to_status' => 'draft', 'changed_by' => $admin->id,
            ]);
            WorkOrderStatusLog::create([
                'wo_id' => $wo1->id, 'from_status' => 'draft', 'to_status' => 'pending', 'changed_by' => $admin->id,
            ]);
            WorkOrderStatusLog::create([
                'wo_id' => $wo1->id, 'from_status' => 'pending', 'to_status' => 'approved', 'changed_by' => $supervisor->id,
            ]);
            WorkOrderStatusLog::create([
                'wo_id' => $wo1->id, 'from_status' => 'approved', 'to_status' => 'in_progress', 'changed_by' => $mechanic->id,
            ]);
        }

        // Work Order 2: Pending Approval
        if ($asset2 && $supervisor) {
            $wo2 = WorkOrder::create([
                'code'            => 'WO-' . now()->format('Ymd') . '-00002',
                'asset_id'        => $asset2->id,
                'type'            => 'corrective',
                'priority'        => 'high',
                'title'           => 'Perbaikan Track Bulldozer Komatsu D65',
                'description'     => 'Track sebelah kiri mengalami keausan berlebihan. Perlu penggantian track shoe.',
                'status'          => 'pending',
                'supervisor_id'   => $supervisor->id,
                'created_by'      => $admin->id,
                'scheduled_start' => now()->addDays(2),
                'scheduled_end'   => now()->addDays(3),
                'estimated_cost'  => 15000000,
            ]);

            WorkOrderStatusLog::create([
                'wo_id' => $wo2->id, 'from_status' => null, 'to_status' => 'draft', 'changed_by' => $admin->id,
            ]);
            WorkOrderStatusLog::create([
                'wo_id' => $wo2->id, 'from_status' => 'draft', 'to_status' => 'pending', 'changed_by' => $admin->id,
            ]);
        }

        // Work Order 3: Completed
        if ($asset3 && $supervisor && $mechanic) {
            $wo3 = WorkOrder::create([
                'code'             => 'WO-' . now()->format('Ymd') . '-00003',
                'asset_id'         => $asset3->id,
                'type'             => 'preventive',
                'priority'         => 'low',
                'title'            => 'Ganti Oli Blade Motor Grader Volvo G940',
                'description'      => 'Service rutin penggantian oli blade dan cek kondisi cutting edge.',
                'status'           => 'completed',
                'supervisor_id'    => $supervisor->id,
                'created_by'       => $admin->id,
                'approved_by'      => $supervisor->id,
                'scheduled_start'  => now()->subDays(5),
                'scheduled_end'    => now()->subDays(4),
                'actual_start'     => now()->subDays(5),
                'actual_end'       => now()->subDays(4)->addHours(3),
                'estimated_cost'   => 1800000,
                'actual_cost'      => 1750000,
                'completion_notes' => 'Service selesai. Cutting edge masih bagus, tidak perlu diganti.',
                'approved_at'      => now()->subDays(6),
            ]);

            $wo3->assignees()->attach($mechanic->id, ['role' => 'lead']);

            WorkOrderStatusLog::create([
                'wo_id' => $wo3->id, 'from_status' => 'approved', 'to_status' => 'in_progress', 'changed_by' => $mechanic->id,
            ]);
            WorkOrderStatusLog::create([
                'wo_id' => $wo3->id, 'from_status' => 'in_progress', 'to_status' => 'completed', 'changed_by' => $mechanic->id,
                'notes' => 'Service selesai tepat waktu.',
            ]);
        }

        // Spare Parts & Inventory
        $parts = [
            ['code' => 'OLI-001', 'name' => 'Oli Mesin Shell Rimula R4 15W-40', 'unit' => 'liter', 'category' => 'Pelumas', 'brand' => 'Shell', 'min_stock' => 50, 'unit_price' => 45000],
            ['code' => 'FLT-001', 'name' => 'Filter Oli Caterpillar 1R-0739', 'unit' => 'pcs', 'category' => 'Filter', 'brand' => 'Caterpillar', 'min_stock' => 5, 'unit_price' => 185000],
            ['code' => 'FLT-002', 'name' => 'Filter Bahan Bakar Caterpillar 1R-0756', 'unit' => 'pcs', 'category' => 'Filter', 'brand' => 'Caterpillar', 'min_stock' => 5, 'unit_price' => 210000],
            ['code' => 'HYD-001', 'name' => 'Oli Hidrolik Shell Tellus S2 MX 46', 'unit' => 'liter', 'category' => 'Pelumas', 'brand' => 'Shell', 'min_stock' => 30, 'unit_price' => 62000],
            ['code' => 'GRS-001', 'name' => 'Grease Shell Gadus S2 V220', 'unit' => 'kg', 'category' => 'Pelumas', 'brand' => 'Shell', 'min_stock' => 10, 'unit_price' => 75000],
        ];

        foreach ($parts as $partData) {
            $part = SparePart::create($partData);
            Inventory::create([
                'part_id'       => $part->id,
                'location'      => 'gudang-utama',
                'qty_available' => rand(10, 100),
            ]);
        }

        $this->command->info('✅ Work Orders & Spare Parts seeded!');
    }
}
