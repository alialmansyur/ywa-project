<?php

namespace App\Http\Controllers\Api\V1\Asset;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\BreakdownReport;
use App\Models\Finding;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Storage;

class AssetDetailController extends Controller
{
    private function s3Disk(): Filesystem
    {
        return Storage::disk('s3');
    }

    private function storeToS3(UploadedFile $file, string $directory): string
    {
        $disk = $this->s3Disk();

        $path = $disk->putFile($directory, $file);
        if (is_string($path) && trim($path) !== '' && $disk->exists($path)) {
            return $path;
        }

        $fallbackName = uniqid('asset_', true) . '_' . $file->hashName();
        $stored = $disk->putFileAs($directory, $file, $fallbackName);

        if (is_string($stored) && trim($stored) !== '' && $disk->exists($stored)) {
            return $stored;
        }

        throw new \RuntimeException('Upload ke MinIO gagal. Path object kosong.');
    }

    private function resolveFileUrl(?string $path): ?string
    {
        if (!is_string($path) || trim($path) === '') {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $rawUrl = (string) $this->s3Disk()->url($path);
        $parsed = parse_url($rawUrl);
        $host = $parsed['host'] ?? '';

        // Fallback untuk local docker: host virtual MinIO tidak bisa diresolve di browser.
        if ($host === 'minio' || str_ends_with($host, '.minio')) {
            $bucket = (string) Config::get('filesystems.disks.s3.bucket', '');
            $publicBase = rtrim((string) env('MINIO_PUBLIC_URL', 'http://localhost:9000'), '/');
            return $publicBase . '/' . $bucket . '/' . ltrim($path, '/');
        }

        return $rawUrl;
    }

    private function findAssetByRef(string $assetRef): Asset
    {
        return Asset::query()
            ->where('public_uuid', $assetRef)
            ->orWhere('qr_code', $assetRef)
            ->orWhere('code', $assetRef)
            ->firstOrFail();
    }

    public function show(string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef)->load([
            'category',
            'latestLocation',
            'preventiveSetting',
            'photos',
            'documents',
        ]);

        return response()->json([
            'asset' => $asset,
            'meta' => [
                'asset_ref' => $assetRef,
                'resolved_by' => $asset->public_uuid === $assetRef ? 'public_uuid' : ($asset->qr_code === $assetRef ? 'qr_code' : 'code'),
            ],
        ]);
    }

    public function updateAsset(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'io_code' => ['nullable', 'string', 'max:100'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'company_code' => ['nullable', 'string', 'max:20'],
            'plant' => ['nullable', 'string', 'max:50'],
            'plant_code' => ['nullable', 'string', 'max:20'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
            'category_id' => ['nullable', 'exists:asset_categories,id'],
            'status' => ['nullable', 'in:active,inactive,maintenance,breakdown'],
            'serial_number' => ['nullable', 'string'],
            'chasis_no' => ['nullable', 'string', 'max:100'],
            'engine_number' => ['nullable', 'string', 'max:100'],
            'engine_no' => ['nullable', 'string', 'max:100'],
            'sap_asset_no' => ['nullable', 'string', 'max:100'],
            'asset_no' => ['nullable', 'string', 'max:100'],
            'plate_number' => ['nullable', 'string'],
            'veh_plate_no' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
            'current_hm' => ['nullable', 'numeric', 'min:0'],
            'current_km' => ['nullable', 'numeric', 'min:0'],
        ]);

        $asset->update($validated);

        return response()->json([
            'message' => 'Data asset diperbarui.',
            'asset' => $asset->fresh()->load(['category', 'latestLocation']),
        ]);
    }

    public function photos(string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $photos = $asset->photos()->get()->map(function ($item) {
            $item->photo_path = $this->resolveFileUrl($item->photo_path);
            return $item;
        });

        return response()->json([
            'asset_ref' => $assetRef,
            'data' => $photos,
        ]);
    }

    public function preventive(string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef)->load('preventiveSetting');

        return response()->json([
            'asset_ref' => $assetRef,
            'data' => $asset->preventiveSetting,
        ]);
    }

    public function updatePreventive(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $validated = $request->validate([
            'trigger_type' => ['required', 'in:hm,km,calendar'],
            'alert_before_value' => ['nullable', 'numeric', 'min:0'],
            'escalation_target' => ['nullable', 'in:planner,supervisor,planner_supervisor'],
            'auto_create_work_order' => ['nullable', 'boolean'],
            'notification_channels' => ['nullable', 'array'],
            'notes' => ['nullable', 'string'],
        ]);

        $setting = $asset->preventiveSetting()->updateOrCreate(
            ['asset_id' => $asset->id],
            [
                'trigger_type' => $validated['trigger_type'],
                'alert_before_value' => $validated['alert_before_value'] ?? 25,
                'escalation_target' => $validated['escalation_target'] ?? 'planner_supervisor',
                'auto_create_work_order' => $validated['auto_create_work_order'] ?? true,
                'notification_channels' => $validated['notification_channels'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ],
        );

        return response()->json([
            'message' => 'Setting preventive diperbarui.',
            'data' => $setting,
        ]);
    }

    public function schedules(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $query = $asset->maintenanceSchedules()->orderBy('next_due_at');

        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        return response()->json([
            'asset_ref' => $assetRef,
            'data' => $query->get(),
        ]);
    }

    public function storeSchedule(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $validated = $request->validate([
            'type' => ['required', 'in:preventive,periodic,conditional'],
            'name' => ['required', 'string', 'max:255'],
            'interval_hm' => ['nullable', 'numeric', 'min:0'],
            'interval_km' => ['nullable', 'numeric', 'min:0'],
            'next_due_at' => ['nullable', 'date'],
            'next_due_hm' => ['nullable', 'numeric', 'min:0'],
            'next_due_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:scheduled,due,overdue,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule = $asset->maintenanceSchedules()->create([
            'type' => $validated['type'],
            'name' => $validated['name'],
            'interval_hm' => $validated['interval_hm'] ?? null,
            'interval_km' => $validated['interval_km'] ?? null,
            'next_due_at' => $validated['next_due_at'] ?? null,
            'next_due_hm' => $validated['next_due_hm'] ?? null,
            'next_due_km' => $validated['next_due_km'] ?? null,
            'status' => $validated['status'] ?? 'scheduled',
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'Jadwal preventive ditambahkan.',
            'data' => $schedule,
        ], 201);
    }

    public function updateSchedule(Request $request, string $assetRef, int $scheduleId): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $schedule = $asset->maintenanceSchedules()->where('id', $scheduleId)->firstOrFail();

        $validated = $request->validate([
            'type' => ['nullable', 'in:preventive,periodic,conditional'],
            'name' => ['nullable', 'string', 'max:255'],
            'interval_hm' => ['nullable', 'numeric', 'min:0'],
            'interval_km' => ['nullable', 'numeric', 'min:0'],
            'next_due_at' => ['nullable', 'date'],
            'next_due_hm' => ['nullable', 'numeric', 'min:0'],
            'next_due_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:scheduled,due,overdue,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule->update($validated);

        return response()->json([
            'message' => 'Jadwal preventive diperbarui.',
            'data' => $schedule->fresh(),
        ]);
    }

    public function cancelSchedule(string $assetRef, int $scheduleId): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $schedule = $asset->maintenanceSchedules()->where('id', $scheduleId)->firstOrFail();
        $schedule->delete();

        return response()->json([
            'message' => 'Jadwal preventive dibatalkan.',
        ]);
    }

    public function workshopHistory(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $history = $asset->workshopHistories()
            ->when($request->category, fn ($q) => $q->where('category', $request->string('category')))
            ->paginate($request->integer('per_page', 15));

        return response()->json($history);
    }

    public function kpis(string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $breakdownCount = BreakdownReport::query()
            ->where('asset_id', $asset->id)
            ->where('status', 'done')
            ->count();

        $findingsCount = Finding::query()
            ->where('asset_id', $asset->id)
            ->count();

        return response()->json([
            'asset_ref' => $assetRef,
            'data' => [
                'breakdown_count' => $breakdownCount,
                'findings_count' => $findingsCount,
            ],
        ]);
    }

    public function storeWorkshopHistory(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);

        $validated = $request->validate([
            'reference_no' => ['nullable', 'string', 'max:100'],
            'category' => ['required', 'in:preventive,corrective,breakdown,refurbish'],
            'date_in' => ['nullable', 'date'],
            'date_out' => ['nullable', 'date'],
            'issue' => ['nullable', 'string', 'max:255'],
            'action_taken' => ['nullable', 'string'],
            'cost' => ['nullable', 'numeric', 'min:0'],
            'downtime_hours' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $history = $asset->workshopHistories()->create([
            'reference_no' => $validated['reference_no'] ?? null,
            'category' => $validated['category'],
            'date_in' => $validated['date_in'] ?? null,
            'date_out' => $validated['date_out'] ?? null,
            'issue' => $validated['issue'] ?? null,
            'action_taken' => $validated['action_taken'] ?? null,
            'cost' => $validated['cost'] ?? 0,
            'downtime_hours' => $validated['downtime_hours'] ?? 0,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'message' => 'History workshop ditambahkan.',
            'data' => $history,
        ], 201);
    }

    public function documents(string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $documents = $asset->documents()->latest()->get()->map(function ($item) {
            $item->file_path = $this->resolveFileUrl($item->file_path);
            return $item;
        });

        return response()->json([
            'asset_ref' => $assetRef,
            'data' => $documents,
        ]);
    }

    public function uploadPhoto(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $validated = $request->validate([
            'photo' => ['required', 'file', 'image', 'max:5120'],
            'title' => ['nullable', 'string', 'max:255'],
            'is_primary' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string'],
        ]);

        $filePath = $this->storeToS3($request->file('photo'), 'assets/photos');
        $photo = $asset->photos()->create([
            'title' => $validated['title'] ?? $request->file('photo')->getClientOriginalName(),
            'photo_path' => $filePath,
            'is_primary' => $validated['is_primary'] ?? false,
            'notes' => $validated['notes'] ?? null,
        ]);

        $photo->photo_path = $this->resolveFileUrl($photo->photo_path);

        return response()->json([
            'message' => 'Foto asset berhasil diupload.',
            'data' => $photo,
        ], 201);
    }

    public function deletePhoto(string $assetRef, int $photoId): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $photo = $asset->photos()->where('id', $photoId)->firstOrFail();

        $path = (string) ($photo->getRawOriginal('photo_path') ?? '');
        if ($path !== '' && !str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
            try {
                $this->s3Disk()->delete($path);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $photo->delete();

        return response()->json([
            'message' => 'Foto asset berhasil dihapus.',
        ]);
    }

    public function uploadDocument(Request $request, string $assetRef): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf,jpg,jpeg,png,webp,doc,docx,xls,xlsx', 'max:10240'],
            'type' => ['required', 'in:stnk,bpkb,kir,insurance,other'],
            'document_number' => ['nullable', 'string', 'max:100'],
            'issued_at' => ['nullable', 'date'],
            'expired_at' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        $filePath = $this->storeToS3($request->file('file'), 'assets/documents');
        $document = $asset->documents()->create([
            'type' => $validated['type'],
            'file_path' => $filePath,
            'document_number' => $validated['document_number'] ?? null,
            'issued_at' => $validated['issued_at'] ?? null,
            'expired_at' => $validated['expired_at'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        $document->file_path = $this->resolveFileUrl($document->file_path);

        return response()->json([
            'message' => 'Dokumen asset berhasil diupload.',
            'data' => $document,
        ], 201);
    }

    public function deleteDocument(string $assetRef, int $documentId): JsonResponse
    {
        $asset = $this->findAssetByRef($assetRef);
        $document = $asset->documents()->where('id', $documentId)->firstOrFail();

        $path = (string) ($document->getRawOriginal('file_path') ?? '');
        if ($path !== '' && !str_starts_with($path, 'http://') && !str_starts_with($path, 'https://')) {
            try {
                $this->s3Disk()->delete($path);
            } catch (\Throwable $e) {
                report($e);
            }
        }

        $document->delete();

        return response()->json([
            'message' => 'Dokumen asset berhasil dihapus.',
        ]);
    }
}
