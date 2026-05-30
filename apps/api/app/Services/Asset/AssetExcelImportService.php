<?php

namespace App\Services\Asset;

use App\Models\Asset;
use App\Models\AssetCategory;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class AssetExcelImportService
{
    public function import(string $filePath, bool $dryRun = false): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getSheet(0);
        $rows = $sheet->toArray(null, true, true, true);

        if (count($rows) < 2) {
            return ['created' => 0, 'updated' => 0, 'skipped' => 0, 'total' => 0];
        }

        $headerRow = array_shift($rows);
        $headerMap = $this->buildHeaderMap($headerRow);

        $created = 0;
        $updated = 0;
        $skipped = 0;

        foreach ($rows as $row) {
            $ioCode = trim((string) ($row[$headerMap['io_code'] ?? ''] ?? ''));
            $name = trim((string) ($row[$headerMap['description'] ?? ''] ?? ''));

            if ($ioCode === '' || $name === '') {
                $skipped++;
                continue;
            }

            $category = $this->resolveCategory($name);
            $companyCode = $this->nullableValue($row[$headerMap['company_code'] ?? ''] ?? null);
            $plant = $this->nullableValue($row[$headerMap['plant'] ?? ''] ?? null);
            $vehPlateNo = $this->nullableValue($row[$headerMap['veh_plate_no'] ?? ''] ?? null);
            $chasisNo = $this->nullableValue($row[$headerMap['chasis_no'] ?? ''] ?? null);
            $engineNo = $this->nullableValue($row[$headerMap['engine_no'] ?? ''] ?? null);
            $assetNo = $this->nullableValue($row[$headerMap['asset_no'] ?? ''] ?? null);

            $payload = [
                'name' => $name,
                'category_id' => $category?->id ?? $this->fallbackCategory()->id,
                'io_code' => $ioCode,
                'company_code' => $companyCode,
                'plant' => $plant,
                'plant_code' => $plant,
                'veh_plate_no' => $vehPlateNo,
                'plate_number' => $vehPlateNo,
                'chasis_no' => $chasisNo,
                'serial_number' => $chasisNo,
                'engine_no' => $engineNo,
                'engine_number' => $engineNo,
                'asset_no' => $assetNo,
                'sap_asset_no' => $assetNo,
                'status' => 'active',
            ];

            $processor = function () use ($ioCode, $payload, &$created, &$updated) {
                $existing = Asset::query()
                    ->where('io_code', $ioCode)
                    ->orWhere('code', $ioCode)
                    ->first();

                if ($existing) {
                    $existing->update($payload + ['code' => $existing->code ?: $ioCode]);
                    $updated++;
                    return;
                }

                Asset::create([
                    ...$payload,
                    'code' => $ioCode,
                    'public_uuid' => (string) Str::uuid(),
                    'qr_code' => 'TAPG-' . strtoupper(Str::random(8)),
                    'current_hm' => 0,
                    'current_km' => 0,
                ]);
                $created++;
            };

            if ($dryRun) {
                DB::beginTransaction();
                try {
                    $processor();
                    DB::rollBack();
                } catch (\Throwable $e) {
                    DB::rollBack();
                    throw $e;
                }
            } else {
                DB::transaction($processor, 5);
            }
        }

        return [
            'created' => $created,
            'updated' => $updated,
            'skipped' => $skipped,
            'total' => $created + $updated + $skipped,
        ];
    }

    private function buildHeaderMap(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $column => $value) {
            $normalized = strtolower(trim((string) $value));
            if ($normalized === '') {
                continue;
            }

            if (str_contains($normalized, 'kode io')) $map['io_code'] = $column;
            if (str_contains($normalized, 'description')) $map['description'] = $column;
            if (str_contains($normalized, 'company code')) $map['company_code'] = $column;
            if ($normalized === 'plant') $map['plant'] = $column;
            if (str_contains($normalized, 'veh. plate no') || str_contains($normalized, 'no. polisi')) $map['veh_plate_no'] = $column;
            if (str_contains($normalized, 'chasis no')) $map['chasis_no'] = $column;
            if (str_contains($normalized, 'engine no')) $map['engine_no'] = $column;
            if (str_contains($normalized, 'asset no')) $map['asset_no'] = $column;
        }

        return $map;
    }

    private function resolveCategory(string $description): ?AssetCategory
    {
        $value = strtolower(' ' . $description . ' ');

        $keywordMap = [
            'Dump Truck' => ['dump truck', ' dt', ' truck '],
            'Excavator' => ['excavator', 'pc200', 'pc300', 'pc400', 'zx', 'ec210', 'ec330'],
            'Bulldozer' => ['bulldozer', 'dozer', 'd65', 'd85', 'd155'],
            'Loader' => ['loader', 'backhoe', 'wheel loader', 'wa200', 'wa320'],
            'Bus' => ['bus sekolah', 'bus karyawan', 'bus '],
            'Crane' => ['crane', 'crawler crane', 'truck crane'],
            'Motor Grader' => ['motor grader', 'grader', 'gd535', 'g940'],
            'Forklift' => ['forklift', 'reach truck', 'stacker'],
            'Water Truck' => ['water truck', 'fuel truck', 'service truck', 'tangki'],
            'Compactor' => ['compactor', 'vibro', 'roller', 'bomag'],
            'Light Vehicle' => ['avanza', 'hilux', 'triton', 'strada', 'pajero', 'innova', 'fortuner', 'lv '],
            'Generator' => ['genset', 'generator'],
        ];

        foreach ($keywordMap as $category => $keywords) {
            foreach ($keywords as $keyword) {
                if (str_contains($value, $keyword)) {
                    return $this->findOrCreateCategory($category);
                }
            }
        }

        return null;
    }

    private function fallbackCategory(): AssetCategory
    {
        return $this->findOrCreateCategory('General Asset');
    }

    private function findOrCreateCategory(string $name): AssetCategory
    {
        return AssetCategory::query()->firstOrCreate(
            ['name' => $name],
            ['description' => 'Auto-created by asset import']
        );
    }

    private function nullableValue(mixed $value): ?string
    {
        $v = trim((string) $value);
        return $v === '' ? null : $v;
    }
}
