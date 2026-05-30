<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class DatabaseBackupController extends Controller
{
    private string $backupRelativeDir = 'backups/database';

    public function index(): JsonResponse
    {
        $directory = storage_path('app/private/' . $this->backupRelativeDir);
        if (!is_dir($directory)) {
            return response()->json(['data' => []]);
        }

        $files = collect(scandir($directory) ?: [])
            ->filter(fn ($file) => is_string($file) && str_ends_with($file, '.sql'))
            ->map(function ($file) use ($directory) {
                $fullPath = $directory . DIRECTORY_SEPARATOR . $file;
                return [
                    'name' => $file,
                    'size_bytes' => is_file($fullPath) ? filesize($fullPath) : 0,
                    'created_at' => is_file($fullPath) ? Carbon::createFromTimestamp((int) filemtime($fullPath))->toISOString() : null,
                ];
            })
            ->sortByDesc('created_at')
            ->values();

        return response()->json(['data' => $files]);
    }

    public function store(Request $request): JsonResponse
    {
        $connection = config('database.default');
        $dbConfig = config("database.connections.{$connection}");

        if (!is_array($dbConfig) || (($dbConfig['driver'] ?? null) !== 'mysql')) {
            return response()->json(['message' => 'Backup database hanya mendukung driver MySQL.'], 422);
        }

        $database = (string) ($dbConfig['database'] ?? '');
        if ($database === '') {
            return response()->json(['message' => 'Konfigurasi database tidak lengkap untuk proses backup.'], 422);
        }

        $directory = storage_path('app/private/' . $this->backupRelativeDir);
        if (!is_dir($directory)) {
            mkdir($directory, 0775, true);
        }

        $fileName = 'db-backup-' . now()->format('Ymd-His') . '.sql';
        $fullPath = $directory . DIRECTORY_SEPARATOR . $fileName;

        try {
            $pdo = DB::connection()->getPdo();
            $tableRows = DB::select('SHOW FULL TABLES WHERE Table_type = "BASE TABLE"');
            $tables = collect($tableRows)
                ->map(fn ($row) => (array) $row)
                ->map(fn ($row) => array_values($row)[0] ?? null)
                ->filter(fn ($table) => is_string($table) && $table !== '')
                ->values();

            $sql = [];
            $sql[] = '-- TAPG Maintenance Database Backup';
            $sql[] = '-- Generated at: ' . now()->toDateTimeString();
            $sql[] = 'SET FOREIGN_KEY_CHECKS=0;';
            $sql[] = '';

            foreach ($tables as $table) {
                $createRow = DB::selectOne("SHOW CREATE TABLE `{$table}`");
                $createArray = (array) $createRow;
                $createStatement = $createArray['Create Table'] ?? array_values($createArray)[1] ?? null;

                if (!is_string($createStatement) || $createStatement === '') {
                    continue;
                }

                $sql[] = "-- Table structure for `{$table}`";
                $sql[] = "DROP TABLE IF EXISTS `{$table}`;";
                $sql[] = $createStatement . ';';
                $sql[] = '';

                $rows = DB::table($table)->get();
                if ($rows->isEmpty()) {
                    continue;
                }

                $sql[] = "-- Dumping data for `{$table}`";
                foreach ($rows as $row) {
                    $columns = array_keys((array) $row);
                    $values = array_map(function ($value) use ($pdo) {
                        if ($value === null) return 'NULL';
                        if (is_bool($value)) return $value ? '1' : '0';
                        if (is_int($value) || is_float($value)) return (string) $value;
                        return $pdo->quote((string) $value);
                    }, array_values((array) $row));

                    $columnList = implode(', ', array_map(fn ($column) => "`{$column}`", $columns));
                    $valueList = implode(', ', $values);
                    $sql[] = "INSERT INTO `{$table}` ({$columnList}) VALUES ({$valueList});";
                }
                $sql[] = '';
            }

            $sql[] = 'SET FOREIGN_KEY_CHECKS=1;';
            file_put_contents($fullPath, implode(PHP_EOL, $sql) . PHP_EOL);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Gagal membuat backup database.',
                'error' => $e->getMessage(),
            ], 500);
        }

        return response()->json([
            'message' => 'Backup database berhasil dibuat.',
            'data' => [
                'name' => $fileName,
                'size_bytes' => is_file($fullPath) ? filesize($fullPath) : 0,
                'created_at' => now()->toISOString(),
            ],
        ], 201);
    }

    public function download(string $file): BinaryFileResponse
    {
        $fileName = basename($file);
        if (!str_ends_with($fileName, '.sql')) {
            abort(404);
        }

        $fullPath = storage_path('app/private/' . $this->backupRelativeDir . '/' . $fileName);
        if (!is_file($fullPath)) {
            abort(404);
        }

        return response()->download($fullPath, $fileName, [
            'Content-Type' => 'application/sql',
        ]);
    }
}
