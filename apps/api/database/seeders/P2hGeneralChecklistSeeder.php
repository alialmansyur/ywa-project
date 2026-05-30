<?php

namespace Database\Seeders;

use App\Models\P2hTemplate;
use Illuminate\Database\Seeder;

class P2hGeneralChecklistSeeder extends Seeder
{
    public function run(): void
    {
        P2hTemplate::updateOrCreate(
            [
                'name' => 'P2H General Harian',
                'version' => 1,
            ],
            [
                'asset_category_id' => null,
                'applies_to_all_assets' => true,
                'effective_from' => now()->toDateString(),
                'effective_to' => null,
                'change_notes' => 'Checklist general default untuk semua aset.',
                'is_active' => true,
                'items' => [
                    ['group' => 'Safety', 'item_name' => 'Cek APAR tersedia', 'type' => 'checkbox'],
                    ['group' => 'Safety', 'item_name' => 'Cek alarm mundur & klakson', 'type' => 'checkbox'],
                    ['group' => 'Mesin', 'item_name' => 'Cek level oli mesin', 'type' => 'checkbox'],
                    ['group' => 'Mesin', 'item_name' => 'Cek air radiator', 'type' => 'checkbox'],
                    ['group' => 'Operasional', 'item_name' => 'Cek lampu kerja & lampu utama', 'type' => 'checkbox'],
                    ['group' => 'Kabin', 'item_name' => 'Cek seat belt operator', 'type' => 'checkbox'],
                    ['group' => 'Visual', 'item_name' => 'Cek potensi kebocoran fluida', 'type' => 'checkbox'],
                    ['group' => 'Catatan', 'item_name' => 'Apakah ada temuan khusus?', 'type' => 'text'],
                ],
            ]
        );
    }
}

