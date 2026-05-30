<?php

namespace App\Console\Commands;

use App\Services\User\UserExcelImportService;
use Illuminate\Console\Command;

class ImportWorkshopEmployeesCommand extends Command
{
    protected $signature = 'users:import-workshop {file : Path file xlsx/csv}';

    protected $description = 'Import data karyawan workshop menjadi user role operator';

    public function handle(UserExcelImportService $service): int
    {
        $file = (string) $this->argument('file');

        if (!is_file($file)) {
            $this->error('File tidak ditemukan: ' . $file);
            return self::FAILURE;
        }

        $result = $service->import($file, 'operator');

        $this->info('Import selesai.');
        $this->table(['Created', 'Updated', 'Skipped', 'Total'], [[
            $result['created'],
            $result['updated'],
            $result['skipped'],
            $result['total'],
        ]]);

        return self::SUCCESS;
    }
}
