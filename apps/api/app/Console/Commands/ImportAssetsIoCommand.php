<?php

namespace App\Console\Commands;

use App\Services\Asset\AssetExcelImportService;
use Illuminate\Console\Command;

class ImportAssetsIoCommand extends Command
{
    protected $signature = 'assets:import-io
                            {file : Path file xlsx/csv}
                            {--dry-run : Simulasi import tanpa simpan data}';

    protected $description = 'Import data asset dari file ASET + IO.xlsx';

    public function handle(AssetExcelImportService $service): int
    {
        $file = (string) $this->argument('file');

        if (!is_file($file)) {
            $this->error('File tidak ditemukan: ' . $file);
            return self::FAILURE;
        }

        $result = $service->import($file, (bool) $this->option('dry-run'));

        $this->info('Import aset selesai' . ($this->option('dry-run') ? ' (dry-run).' : '.'));
        $this->table(['Created', 'Updated', 'Skipped', 'Total'], [[
            $result['created'],
            $result['updated'],
            $result['skipped'],
            $result['total'],
        ]]);

        return self::SUCCESS;
    }
}
