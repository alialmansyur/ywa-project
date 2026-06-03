<?php

namespace App\Http\Controllers\Api\V1\Finding;

use App\Http\Controllers\Controller;
use App\Models\Finding;
use App\Services\Approval\ApprovalWorkflowService;
use App\Services\Notification\NotificationDispatcherService;
use Illuminate\Contracts\Filesystem\Filesystem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class FindingController extends Controller
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

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

        throw new \RuntimeException('Upload file ke MinIO gagal.');
    }

    private function resolveFileUrl(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://')) {
            return $path;
        }

        $rawUrl = (string) $this->s3Disk()->url($path);
        $host = parse_url($rawUrl, PHP_URL_HOST) ?: '';
        if ($host === 'minio' || str_ends_with($host, '.minio')) {
            $bucket = (string) Config::get('filesystems.disks.s3.bucket', '');
            $publicBase = rtrim((string) env('MINIO_PUBLIC_URL', 'http://localhost:9000'), '/');
            return $publicBase . '/' . $bucket . '/' . ltrim($path, '/');
        }

        return $rawUrl;
    }

    private function decorate(Finding $finding): array
    {
        $row = $finding->toArray();
        $row['photo_url'] = $this->resolveFileUrl($finding->photo_path);
        return $row;
    }

    private function canManageFinding(Request $request, Finding $finding): bool
    {
        if ((int) $finding->reporter_id === (int) $request->user()->id) {
            return true;
        }

        return $request->user()->hasAnyPermission(['approve work-orders', 'manage settings', 'manage system settings']);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Finding::query()->with(['asset:id,name,code,plate_number', 'reporter:id,name']);

        if ($request->filled('asset_id')) {
            $query->where('asset_id', $request->integer('asset_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $search = (string) $request->search;
            $query->where(function ($scoped) use ($search) {
                $scoped->whereHas('asset', function ($q) use ($search) {
                    $q->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('plate_number', 'like', "%{$search}%");
                })->orWhere('description', 'like', "%{$search}%");
            });
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        if ($request->boolean('mine')) {
            $query->where('reporter_id', $request->user()->id);
        }

        $rows = $query->latest()->paginate($request->integer('per_page', 20));
        $rows->setCollection($rows->getCollection()->map(fn ($x) => $this->decorate($x)));

        return response()->json($rows);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => ['required', 'exists:assets,id'],
            'section' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:5000'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        $approvalTemplate = $request->attributes->get('approval.template');

        $finding = DB::transaction(function () use ($validated, $request, $approvalTemplate) {
            $photoPath = isset($validated['photo']) ? $this->storeToS3($validated['photo'], 'findings/photos') : null;
            $status = $approvalTemplate ? 'in_review' : 'submitted';

            $finding = Finding::create([
                'code' => 'TEM-' . now()->format('ymd') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                'asset_id' => $validated['asset_id'],
                'reporter_id' => $request->user()->id,
                'section' => $validated['section'],
                'description' => $validated['description'],
                'status' => $status,
                'photo_path' => $photoPath,
            ]);

            if ($approvalTemplate) {
                $this->approvalWorkflowService->createApprovalRequest(
                    $approvalTemplate,
                    Finding::class,
                    (int) $finding->id,
                    (int) $request->user()->id,
                    [
                        'code' => $finding->code,
                        'asset_id' => $finding->asset_id,
                        'section' => $finding->section,
                    ],
                    [
                        'route_key' => $request->attributes->get('approval.route_key'),
                    ]
                );
            }

            return $finding;
        });

        NotificationDispatcherService::dispatchToAdmins(
            'Temuan Baru Masuk',
            'Temuan ' . $finding->code . ' menunggu tindak lanjut.',
            NotificationDispatcherService::buildRouteTargetPayload([
                'entity_type' => 'finding',
                'entity_id' => $finding->id,
                'code' => $finding->code,
                'asset_id' => $finding->asset_id,
            ], [
                'mobile' => [
                    'route_name' => 'findings.index',
                    'route' => '/(tabs)/findings',
                    'params' => ['finding_id' => (string) $finding->id],
                ],
                'admin' => [
                    'route_name' => 'findings.index',
                    'route' => '/findings',
                    'params' => ['finding_id' => (string) $finding->id],
                ],
            ], '/findings', '/findings'),
            'finding_event'
        );

        return response()->json([
            'message' => $approvalTemplate
                ? 'Temuan berhasil dibuat dan menunggu approval.'
                : 'Temuan berhasil dibuat.',
            'approval_required' => (bool) $approvalTemplate,
            'data' => $this->decorate($finding->load(['asset:id,name,code', 'reporter:id,name'])),
        ], 201);
    }

    public function show(Finding $finding): JsonResponse
    {
        return response()->json($this->decorate($finding->load(['asset:id,name,code', 'reporter:id,name'])));
    }

    public function update(Request $request, Finding $finding): JsonResponse
    {
        abort_unless($this->canManageFinding($request, $finding), 403, 'Anda tidak dapat mengubah temuan ini.');

        $validated = $request->validate([
            'section' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'string', 'max:5000'],
            'status' => ['sometimes', 'in:submitted,in_review,resolved'],
            'resolution_notes' => ['nullable', 'string', 'max:5000'],
            'photo' => ['nullable', 'file', 'image', 'max:5120'],
        ]);

        if (isset($validated['photo'])) {
            $validated['photo_path'] = $this->storeToS3($validated['photo'], 'findings/photos');
            unset($validated['photo']);
        }

        if (($validated['status'] ?? null) === 'resolved') {
            $validated['resolved_at'] = now();
        }

        $finding->update($validated);

        if (($validated['status'] ?? null) === 'resolved') {
            NotificationDispatcherService::dispatchToUser(
                (int) $finding->reporter_id,
                'Temuan Ditanggapi',
                'Temuan ' . $finding->code . ' telah mendapatkan feedback.',
                NotificationDispatcherService::buildRouteTargetPayload([
                    'entity_type' => 'finding',
                    'entity_id' => $finding->id,
                    'status' => 'resolved',
                ], [
                    'mobile' => [
                        'route_name' => 'findings.index',
                        'route' => '/(tabs)/findings',
                        'params' => ['finding_id' => (string) $finding->id],
                    ],
                    'admin' => [
                        'route_name' => 'findings.index',
                        'route' => '/findings',
                        'params' => ['finding_id' => (string) $finding->id],
                    ],
                ], '/findings', '/findings'),
                'finding_event'
            );
        }

        return response()->json([
            'message' => 'Temuan berhasil diperbarui.',
            'data' => $this->decorate($finding->fresh()->load(['asset:id,name,code', 'reporter:id,name'])),
        ]);
    }

    public function destroy(Request $request, Finding $finding): JsonResponse
    {
        abort_unless($this->canManageFinding($request, $finding), 403, 'Anda tidak dapat menghapus temuan ini.');

        $finding->delete();

        return response()->json(['message' => 'Temuan berhasil dihapus.']);
    }
}
