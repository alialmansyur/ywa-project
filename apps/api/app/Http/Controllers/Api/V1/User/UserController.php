<?php

namespace App\Http\Controllers\Api\V1\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\User\UserExcelImportService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * @tags Users
 */
class UserController extends Controller
{
    public function __construct(private UserExcelImportService $excelImportService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = User::query()->with(['roles:id,name', 'profile']);

        if ($request->filled('search')) {
            $search = strtolower((string) $request->search);
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(name) like ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(email) like ?', ["%{$search}%"])
                    ->orWhereRaw('LOWER(phone) like ?', ["%{$search}%"]);
            });
        }

        if ($request->filled('is_active')) {
            $isActive = filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
            if ($isActive !== null) {
                $query->where('is_active', $isActive);
            }
        }

        if ($request->filled('role')) {
            $query->role($request->role);
        }

        $users = $query->latest()->paginate((int) $request->integer('per_page', 10));

        return response()->json($users);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'data' => Role::query()
                ->select('name')
                ->distinct()
                ->orderBy('name')
                ->pluck('name'),
        ]);
    }

    public function importTemplate(): StreamedResponse
    {
        $header = ['Employee Code', 'Employee Name', 'Job Code', 'Sex', 'Status'];
        $sample = ['63/6321/0523/4142', 'MA ROFAN FIKRI ALHAQI', 'MEKANIK KENDARAAN', 'MALE', 'KT'];

        return response()->streamDownload(function () use ($header, $sample) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, $header);
            fputcsv($handle, $sample);
            fclose($handle);
        }, 'user_operator_import_template.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }

    public function importExcel(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,xls,csv|max:10240',
        ]);

        $result = $this->excelImportService->import($request->file('file')->getRealPath(), 'operator');

        return response()->json([
            'message' => 'Import user operator selesai diproses.',
            'result' => $result,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'phone' => 'nullable|string|max:20',
            'password' => ['required', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/'],
            'is_active' => 'nullable|boolean',
            'role' => 'required|string|exists:roles,name',
            'employee_code' => 'nullable|string|max:64|unique:user_profiles,employee_code',
            'job_code' => 'nullable|string|max:120',
            'sex' => 'nullable|in:male,female,other,unknown',
            'employment_status' => 'nullable|string|max:64',
            'company' => 'nullable|string|max:120',
            'department' => 'nullable|string|max:120',
            'site_location' => 'nullable|string|max:120',
        ], [
            'password.regex' => 'Password wajib kombinasi huruf kecil, huruf besar, angka, dan simbol.',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'is_active' => $validated['is_active'] ?? true,
        ]);

        $user->syncRoles([$validated['role']]);
        $user->profile()->updateOrCreate(['user_id' => $user->id], [
            'employee_code' => $validated['employee_code'] ?? null,
            'job_code' => $validated['job_code'] ?? null,
            'sex' => $validated['sex'] ?? 'unknown',
            'employment_status' => $validated['employment_status'] ?? null,
            'company' => $validated['company'] ?? null,
            'department' => $validated['department'] ?? null,
            'site_location' => $validated['site_location'] ?? null,
        ]);

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'user' => $user->fresh()->load(['roles:id,name', 'profile']),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => ['nullable', 'string', 'min:8', 'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/'],
            'is_active' => 'required|boolean',
            'role' => 'required|string|exists:roles,name',
            'employee_code' => ['nullable', 'string', 'max:64', Rule::unique('user_profiles', 'employee_code')->ignore($user->profile?->id)],
            'job_code' => 'nullable|string|max:120',
            'sex' => 'nullable|in:male,female,other,unknown',
            'employment_status' => 'nullable|string|max:64',
            'company' => 'nullable|string|max:120',
            'department' => 'nullable|string|max:120',
            'site_location' => 'nullable|string|max:120',
        ], [
            'password.regex' => 'Password wajib kombinasi huruf kecil, huruf besar, angka, dan simbol.',
        ]);

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'is_active' => $validated['is_active'],
        ];

        if (!empty($validated['password'])) {
            $payload['password'] = Hash::make($validated['password']);
        }

        $user->update($payload);
        $user->syncRoles([$validated['role']]);
        $user->profile()->updateOrCreate(['user_id' => $user->id], [
            'employee_code' => $validated['employee_code'] ?? null,
            'job_code' => $validated['job_code'] ?? null,
            'sex' => $validated['sex'] ?? 'unknown',
            'employment_status' => $validated['employment_status'] ?? null,
            'company' => $validated['company'] ?? null,
            'department' => $validated['department'] ?? null,
            'site_location' => $validated['site_location'] ?? null,
        ]);

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'user' => $user->fresh()->load(['roles:id,name', 'profile']),
        ]);
    }

    public function toggleActive(User $user): JsonResponse
    {
        $user->update(['is_active' => !$user->is_active]);

        return response()->json([
            'message' => $user->is_active ? 'User berhasil diaktifkan.' : 'User berhasil dinonaktifkan.',
            'user' => $user->fresh()->load(['roles:id,name', 'profile']),
        ]);
    }

    public function resetPassword(User $user): JsonResponse
    {
        $user->update([
            'password' => Hash::make('Ywa@2026'),
        ]);

        return response()->json([
            'message' => 'Password user berhasil direset ke default (Ywa@2026).',
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->tokens()->delete();
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}
