<?php

namespace App\Services\User;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\IOFactory;

class UserExcelImportService
{
    public function import(string $filePath, string $role = 'operator'): array
    {
        $spreadsheet = IOFactory::load($filePath);
        $sheet = $spreadsheet->getActiveSheet();
        $rows = $sheet->toArray(null, true, true, true);

        if (count($rows) < 2) {
            return ['created' => 0, 'updated' => 0, 'skipped' => 0, 'total' => 0];
        }

        $headerRow = array_shift($rows);
        $headerMap = $this->buildHeaderMap($headerRow);

        $created = 0;
        $updated = 0;
        $skipped = 0;

        DB::transaction(function () use ($rows, $headerMap, $role, &$created, &$updated, &$skipped) {
            foreach ($rows as $row) {
                $name = trim((string) ($row[$headerMap['employee_name'] ?? ''] ?? ''));
                if ($name === '') {
                    $skipped++;
                    continue;
                }

                $employeeCode = trim((string) ($row[$headerMap['employee_code'] ?? ''] ?? ''));
                $jobCode = trim((string) ($row[$headerMap['job_code'] ?? ''] ?? ''));
                $sex = $this->normalizeSex((string) ($row[$headerMap['sex'] ?? ''] ?? ''));
                $status = trim((string) ($row[$headerMap['status'] ?? ''] ?? '')) ?: null;

                $existingProfile = null;
                if ($employeeCode !== '') {
                    $existingProfile = UserProfile::query()->where('employee_code', $employeeCode)->with('user')->first();
                }

                if ($existingProfile && $existingProfile->user) {
                    $user = $existingProfile->user;
                    $user->update(['name' => $name, 'is_active' => true]);
                    $updated++;
                } else {
                    $email = $this->generateUniqueEmail($name, $employeeCode);
                    $user = User::create([
                        'name' => $name,
                        'email' => $email,
                        'password' => Hash::make('Operator#2026'),
                        'is_active' => true,
                    ]);
                    $created++;
                }

                $user->syncRoles([$role]);

                $user->profile()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'employee_code' => $employeeCode !== '' ? $employeeCode : null,
                        'job_code' => $jobCode !== '' ? $jobCode : null,
                        'sex' => $sex,
                        'employment_status' => $status,
                    ]
                );
            }
        });

        return ['created' => $created, 'updated' => $updated, 'skipped' => $skipped, 'total' => $created + $updated + $skipped];
    }

    private function buildHeaderMap(array $headerRow): array
    {
        $map = [];
        foreach ($headerRow as $column => $value) {
            $normalized = strtolower(trim((string) $value));
            $normalized = preg_replace('/\s+/', ' ', $normalized);
            if (str_contains($normalized, 'employee code')) $map['employee_code'] = $column;
            if (str_contains($normalized, 'employee name')) $map['employee_name'] = $column;
            if (str_contains($normalized, 'job code')) $map['job_code'] = $column;
            if ($normalized === 'sex') $map['sex'] = $column;
            if ($normalized === 'status') $map['status'] = $column;
        }

        return $map;
    }

    private function generateUniqueEmail(string $name, string $employeeCode): string
    {
        $base = Str::slug($name, '.');
        if ($base === '') {
            $base = 'operator';
        }

        if ($employeeCode !== '') {
            $code = preg_replace('/[^a-zA-Z0-9]/', '', $employeeCode);
            $base .= '.' . strtolower(substr($code, -6));
        }

        $candidate = $base . '@tapg.operator.local';
        $index = 1;
        while (User::query()->where('email', $candidate)->exists()) {
            $candidate = $base . '.' . $index . '@tapg.operator.local';
            $index++;
        }

        return $candidate;
    }

    private function normalizeSex(string $value): string
    {
        $v = strtoupper(trim($value));
        return match ($v) {
            'M', 'MALE', 'LAKI-LAKI', 'LAKI LAKI', 'PRIA' => 'male',
            'F', 'FEMALE', 'PEREMPUAN', 'WANITA' => 'female',
            'OTHER', 'LAINNYA' => 'other',
            default => 'unknown',
        };
    }
}
