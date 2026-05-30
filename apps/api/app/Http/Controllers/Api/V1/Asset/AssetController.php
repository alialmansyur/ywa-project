<?php

namespace App\Http\Controllers\Api\V1\Asset;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetCategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

/**
 * @tags Assets
 */
class AssetController extends Controller
{
    public function categories(): JsonResponse
    {
        $categories = AssetCategory::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name', 'icon', 'description']);

        return response()->json($categories);
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:asset_categories,name'],
            'icon' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category = AssetCategory::create([
            'name' => $validated['name'],
            'icon' => $validated['icon'] ?? null,
            'description' => $validated['description'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json(['message' => 'Kategori asset berhasil ditambahkan.', 'data' => $category], 201);
    }

    public function updateCategory(Request $request, AssetCategory $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:120', 'unique:asset_categories,name,' . $category->id],
            'icon' => ['nullable', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $category->update($validated);

        return response()->json(['message' => 'Kategori asset berhasil diperbarui.', 'data' => $category->fresh()]);
    }

    public function destroyCategory(AssetCategory $category): JsonResponse
    {
        if (Asset::query()->where('category_id', $category->id)->exists()) {
            return response()->json(['message' => 'Kategori tidak bisa dihapus karena masih dipakai asset.'], 422);
        }

        $category->delete();

        return response()->json(['message' => 'Kategori asset berhasil dihapus.']);
    }

    /**
     * Daftar semua aset (dengan filter & pagination)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Asset::with(['category', 'latestLocation', 'activeAssignment.user:id,name,email'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->category_id, fn ($q) => $q->where('category_id', $request->category_id))
            ->when($request->search, fn ($q) => $q->where(function ($sq) use ($request) {
                $sq->where('name', 'like', "%{$request->search}%")
                    ->orWhere('code', 'like', "%{$request->search}%");
            }))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc');

        $assets = $query->paginate($request->per_page ?? 15);

        return response()->json($assets);
    }

    /**
     * Buat aset baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'          => 'required|string|unique:assets,code',
            'io_code'       => 'nullable|string|max:100',
            'name'          => 'required|string|max:255',
            'brand'         => 'nullable|string|max:100',
            'model'         => 'nullable|string|max:100',
            'company_code'  => 'nullable|string|max:20',
            'plant'         => 'nullable|string|max:50',
            'plant_code'    => 'nullable|string|max:20',
            'year'          => 'nullable|integer|min:1990|max:2100',
            'category_id'   => 'required|exists:asset_categories,id',
            'status'        => 'nullable|in:active,inactive,maintenance,breakdown',
            'current_hm'    => 'nullable|numeric|min:0',
            'current_km'    => 'nullable|numeric|min:0',
            'serial_number' => 'nullable|string',
            'chasis_no'     => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'engine_no'     => 'nullable|string|max:100',
            'sap_asset_no'  => 'nullable|string|max:100',
            'asset_no'      => 'nullable|string|max:100',
            'plate_number'  => 'nullable|string',
            'veh_plate_no'  => 'nullable|string|max:100',
            'notes'         => 'nullable|string',
        ]);

        $validated['public_uuid'] = (string) Str::uuid();
        $validated['qr_code'] = 'TAPG-' . strtoupper(Str::random(8));

        $asset = Asset::create($validated);

        return response()->json([
            'message' => 'Aset berhasil dibuat.',
            'asset'   => $asset->load('category'),
        ], 201);
    }

    /**
     * Detail aset berdasarkan ID
     */
    public function show(Asset $asset): JsonResponse
    {
        $asset->load([
            'category', 'latestLocation', 'maintenanceSchedules',
            'documents',
            'activeAssignment.user:id,name,email',
        ]);

        return response()->json($asset);
    }

    /**
     * Update data aset
     */
    public function update(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'name'          => 'sometimes|string|max:255',
            'io_code'       => 'nullable|string|max:100',
            'brand'         => 'nullable|string|max:100',
            'model'         => 'nullable|string|max:100',
            'company_code'  => 'nullable|string|max:20',
            'plant'         => 'nullable|string|max:50',
            'plant_code'    => 'nullable|string|max:20',
            'year'          => 'nullable|integer|min:1990|max:2100',
            'category_id'   => 'sometimes|exists:asset_categories,id',
            'status'        => 'nullable|in:active,inactive,maintenance,breakdown',
            'serial_number' => 'nullable|string',
            'chasis_no'     => 'nullable|string|max:100',
            'engine_number' => 'nullable|string|max:100',
            'engine_no'     => 'nullable|string|max:100',
            'sap_asset_no'  => 'nullable|string|max:100',
            'asset_no'      => 'nullable|string|max:100',
            'plate_number'  => 'nullable|string',
            'veh_plate_no'  => 'nullable|string|max:100',
            'current_hm'    => 'nullable|numeric|min:0',
            'current_km'    => 'nullable|numeric|min:0',
            'notes'         => 'nullable|string',
        ]);

        $asset->update($validated);

        return response()->json(['message' => 'Aset diperbarui.', 'asset' => $asset->fresh()->load('category')]);
    }

    /**
     * Hapus aset (soft delete)
     */
    public function destroy(Asset $asset): JsonResponse
    {
        $asset->delete();

        return response()->json(['message' => 'Aset dihapus.']);
    }

    /**
     * Scan QR code untuk mendapatkan detail aset
     */
    public function scanQr(string $qr_code): JsonResponse
    {
        $asset = Asset::where('qr_code', $qr_code)
            ->with(['category', 'latestLocation', 'maintenanceSchedules', 'activeAssignment.user:id,name,email'])
            ->firstOrFail();

        return response()->json($asset);
    }

    /**
     * Riwayat HM & KM aset
     */
    public function history(Asset $asset, Request $request): JsonResponse
    {
        $history = $asset->hmLogs()
            ->with('recorder:id,name')
            ->when($request->from, fn ($q) => $q->whereDate('recorded_at', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('recorded_at', '<=', $request->to))
            ->orderBy('recorded_at', 'desc')
            ->paginate($request->per_page ?? 15);

        return response()->json($history);
    }

    /**
     * Jadwal maintenance aset
     */
    public function schedule(Asset $asset): JsonResponse
    {
        $schedules = $asset->maintenanceSchedules()
            ->orderBy('next_due_at')
            ->get();

        return response()->json($schedules);
    }

    /**
     * Update Hour Meter / KM aset
     */
    public function updateHm(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'hm_value' => 'required_without:km_value|numeric|min:0',
            'km_value' => 'required_without:hm_value|numeric|min:0',
            'notes'    => 'nullable|string',
        ]);

        $log = $asset->hmLogs()->create([
            'hm_value'    => $validated['hm_value'] ?? $asset->current_hm,
            'km_value'    => $validated['km_value'] ?? $asset->current_km,
            'recorded_by' => $request->user()->id,
            'notes'       => $validated['notes'] ?? null,
            'recorded_at' => now(),
        ]);

        // Update current values on asset
        $asset->update([
            'current_hm' => $validated['hm_value'] ?? $asset->current_hm,
            'current_km' => $validated['km_value'] ?? $asset->current_km,
        ]);

        return response()->json(['message' => 'HM/KM diperbarui.', 'log' => $log], 201);
    }

    /**
     * Import aset dari file Excel/CSV
     */
    public function import(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:xlsx,csv|max:5120',
        ]);

        // TODO: dispatch ImportAssetsJob
        return response()->json(['message' => 'File diterima, import akan diproses.'], 202);
    }

    /**
     * Export aset ke Excel
     */
    public function export(Request $request): JsonResponse
    {
        // TODO: dispatch GenerateReportJob
        return response()->json(['message' => 'Export sedang diproses. Anda akan mendapat notifikasi.'], 202);
    }

    /**
     * Update lokasi aset
     */
    public function updateLocation(Request $request, Asset $asset): JsonResponse
    {
        $validated = $request->validate([
            'lat'     => 'required|numeric|between:-90,90',
            'lng'     => 'required|numeric|between:-180,180',
            'address' => 'nullable|string',
        ]);

        $location = $asset->locations()->create([
            ...$validated,
            'recorded_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Lokasi diperbarui.', 'location' => $location], 201);
    }
}
