<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\AssetCategory;
use App\Models\HmLog;
use App\Models\MaintenanceSchedule;
use App\Models\P2hTemplate;
use App\Models\User;
use Illuminate\Database\Seeder;

class AssetSeeder extends Seeder
{
    public function run(): void
    {
        $operator = User::where('email', 'operator@tapg.local')->first();

        // Categories
        $excavator = AssetCategory::create(['name' => 'Excavator', 'icon' => '🚧', 'description' => 'Alat gali']);
        $dozer     = AssetCategory::create(['name' => 'Bulldozer', 'icon' => '🚜', 'description' => 'Alat dorong']);
        $dump      = AssetCategory::create(['name' => 'Dump Truck', 'icon' => '🚛', 'description' => 'Truk pengangkut']);
        $grader    = AssetCategory::create(['name' => 'Motor Grader', 'icon' => '🛤️', 'description' => 'Alat perataan']);
        $crane     = AssetCategory::create(['name' => 'Crane', 'icon' => '🏗️', 'description' => 'Alat angkat']);

        // Assets
        $assets = [
            [
                'code'          => 'EXC-001',
                'name'          => 'Excavator CAT 320',
                'brand'         => 'Caterpillar',
                'model'         => '320 GC',
                'year'          => 2021,
                'category_id'   => $excavator->id,
                'status'        => 'active',
                'current_hm'    => 3245.5,
                'current_km'    => 0,
                'qr_code'       => 'TAPG-EXC001',
                'serial_number' => 'CAT320-2021-001',
                'plate_number'  => null,
            ],
            [
                'code'          => 'BLD-001',
                'name'          => 'Bulldozer Komatsu D65',
                'brand'         => 'Komatsu',
                'model'         => 'D65EX-18',
                'year'          => 2020,
                'category_id'   => $dozer->id,
                'status'        => 'active',
                'current_hm'    => 5120.0,
                'current_km'    => 0,
                'qr_code'       => 'TAPG-BLD001',
                'serial_number' => 'KOM-D65-2020-001',
                'plate_number'  => null,
            ],
            [
                'code'          => 'DMP-001',
                'name'          => 'Dump Truck Hino FR',
                'brand'         => 'Hino',
                'model'         => 'FR 500JD',
                'year'          => 2022,
                'category_id'   => $dump->id,
                'status'        => 'active',
                'current_hm'    => 0,
                'current_km'    => 48520.5,
                'qr_code'       => 'TAPG-DMP001',
                'serial_number' => 'HINO-FR-2022-001',
                'plate_number'  => 'B 1234 XYZ',
            ],
            [
                'code'          => 'GRD-001',
                'name'          => 'Motor Grader Volvo G940',
                'brand'         => 'Volvo',
                'model'         => 'G940',
                'year'          => 2019,
                'category_id'   => $grader->id,
                'status'        => 'maintenance',
                'current_hm'    => 7890.0,
                'current_km'    => 0,
                'qr_code'       => 'TAPG-GRD001',
                'serial_number' => 'VOLVO-G940-2019-001',
                'plate_number'  => null,
            ],
            [
                'code'          => 'CRN-001',
                'name'          => 'Crawler Crane Liebherr LR1100',
                'brand'         => 'Liebherr',
                'model'         => 'LR 1100',
                'year'          => 2020,
                'category_id'   => $crane->id,
                'status'        => 'active',
                'current_hm'    => 2100.0,
                'current_km'    => 0,
                'qr_code'       => 'TAPG-CRN001',
                'serial_number' => 'LIEB-LR1100-2020-001',
                'plate_number'  => null,
            ],
        ];

        foreach ($assets as $assetData) {
            $asset = Asset::create($assetData);

            // Add HM log
            if ($operator && $asset->current_hm > 0) {
                HmLog::create([
                    'asset_id'    => $asset->id,
                    'hm_value'    => $asset->current_hm,
                    'km_value'    => $asset->current_km,
                    'recorded_by' => $operator->id,
                    'notes'       => 'Initial HM record dari seeder',
                    'recorded_at' => now(),
                ]);
            }

            // Add maintenance schedule
            MaintenanceSchedule::create([
                'asset_id'    => $asset->id,
                'type'        => 'preventive',
                'name'        => 'Service 250 HM',
                'interval_hm' => 250,
                'last_done_hm' => $asset->current_hm - 120,
                'last_done_at' => now()->subDays(15),
                'next_due_hm' => $asset->current_hm + 130,
                'next_due_at' => now()->addDays(10),
                'status'      => 'scheduled',
            ]);
        }

        // P2H Templates
        P2hTemplate::create([
            'name'              => 'P2H Excavator',
            'asset_category_id' => $excavator->id,
            'is_active'         => true,
            'items'             => [
                ['group' => 'Mesin', 'item_name' => 'Cek level oli mesin', 'type' => 'checkbox'],
                ['group' => 'Mesin', 'item_name' => 'Cek level air radiator', 'type' => 'checkbox'],
                ['group' => 'Mesin', 'item_name' => 'Cek level bahan bakar', 'type' => 'checkbox'],
                ['group' => 'Hidrolik', 'item_name' => 'Cek kebocoran selang hidrolik', 'type' => 'checkbox'],
                ['group' => 'Hidrolik', 'item_name' => 'Cek level oli hidrolik', 'type' => 'checkbox'],
                ['group' => 'Undercarriage', 'item_name' => 'Cek kondisi track & sprocket', 'type' => 'checkbox'],
                ['group' => 'Safety', 'item_name' => 'Cek alarm mundur berfungsi', 'type' => 'checkbox'],
                ['group' => 'Safety', 'item_name' => 'Cek lampu & klakson', 'type' => 'checkbox'],
                ['group' => 'Kabin', 'item_name' => 'Cek seat belt', 'type' => 'checkbox'],
                ['group' => 'Kabin', 'item_name' => 'Cek APAR tersedia', 'type' => 'checkbox'],
            ],
        ]);

        P2hTemplate::create([
            'name'              => 'P2H Dump Truck',
            'asset_category_id' => $dump->id,
            'is_active'         => true,
            'items'             => [
                ['group' => 'Mesin', 'item_name' => 'Cek level oli mesin', 'type' => 'checkbox'],
                ['group' => 'Mesin', 'item_name' => 'Cek tekanan ban (depan & belakang)', 'type' => 'checkbox'],
                ['group' => 'Rem', 'item_name' => 'Cek fungsi rem utama', 'type' => 'checkbox'],
                ['group' => 'Rem', 'item_name' => 'Cek rem parkir', 'type' => 'checkbox'],
                ['group' => 'Lampu', 'item_name' => 'Cek lampu depan & belakang', 'type' => 'checkbox'],
                ['group' => 'Safety', 'item_name' => 'Cek alarm mundur', 'type' => 'checkbox'],
                ['group' => 'Safety', 'item_name' => 'Cek APAR tersedia', 'type' => 'checkbox'],
                ['group' => 'Bak', 'item_name' => 'Cek kondisi bak dump', 'type' => 'checkbox'],
            ],
        ]);

        $this->command->info('✅ Assets, Categories, P2H Templates seeded!');
    }
}
