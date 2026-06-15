<?php

namespace App\Http\Controllers\Api\V1\WorkOrder;

use App\Http\Controllers\Controller;
use App\Models\WorkOrder;
use App\Models\WorkOrderStatusLog;
use App\Services\Approval\ApprovalWorkflowService;
use App\Services\Notification\NotificationDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

/**
 * @tags Work Orders
 */
class WorkOrderController extends Controller
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = WorkOrder::with(['asset:id,name,code,io_code,veh_plate_no,plate_number', 'schedule:id,name,next_due_at,status', 'supervisor:id,name', 'assignees:id,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->priority, fn ($q) => $q->where('priority', $request->priority))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->asset_id, fn ($q) => $q->where('asset_id', $request->asset_id))
            ->when($request->q, function ($q) use ($request) {
                $needle = trim((string) $request->q);
                $q->where(function ($sub) use ($needle) {
                    $sub->where('code', 'like', "%{$needle}%")
                        ->orWhere('sap_reference_no', 'like', "%{$needle}%")
                        ->orWhere('title', 'like', "%{$needle}%")
                        ->orWhere('description', 'like', "%{$needle}%")
                        ->orWhereHas('asset', function ($assetQ) use ($needle) {
                            $assetQ->where('code', 'like', "%{$needle}%")
                                ->orWhere('io_code', 'like', "%{$needle}%")
                                ->orWhere('name', 'like', "%{$needle}%")
                                ->orWhere('veh_plate_no', 'like', "%{$needle}%")
                                ->orWhere('plate_number', 'like', "%{$needle}%")
                                ->orWhere('asset_no', 'like', "%{$needle}%")
                                ->orWhere('serial_number', 'like', "%{$needle}%");
                        });
                });
            })
            ->when($request->from, fn ($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('created_at', '<=', $request->to))
            ->orderBy('created_at', 'desc');

        if ($request->user()->hasRole('mechanic')) {
            $query->whereHas('assignees', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'type' => 'required|in:preventive,corrective,breakdown,inspection',
            'priority' => 'required|in:low,medium,high,critical',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'supervisor_id' => 'nullable|exists:users,id',
            'scheduled_start' => 'nullable|date',
            'scheduled_end' => 'nullable|date|after:scheduled_start',
            'estimated_cost' => 'nullable|numeric|min:0',
            'checklist' => 'nullable|array',
            'checklist.*' => 'string',
            'sap_reference_no' => 'nullable|string|max:64',
            'wo_source' => 'nullable|in:internal,sap',
        ]);

        $resolvedSource = $validated['wo_source'] ?? (!empty($validated['sap_reference_no']) ? 'sap' : 'internal');

        $wo = WorkOrder::create([
            ...$validated,
            'supervisor_id' => $validated['supervisor_id'] ?? $request->user()->id,
            'code' => 'WO-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
            'wo_source' => $resolvedSource,
            'status' => 'draft',
            'created_by' => $request->user()->id,
        ]);

        if (!empty($validated['checklist'])) {
            foreach ($validated['checklist'] as $item) {
                $wo->checklists()->create(['item' => $item]);
            }
        }

        WorkOrderStatusLog::create([
            'wo_id' => $wo->id,
            'from_status' => null,
            'to_status' => 'draft',
            'changed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Work order dibuat.', 'work_order' => $wo->load(['asset', 'supervisor'])], 201);
    }

    /**
     * @tags Work Orders
     * @summary Register new work order (Driver)
     * @description Endpoint for drivers to register a new unit arrival at the workshop.
     */
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
        ]);

        $hasOpenWorkOrder = WorkOrder::query()
            ->where('asset_id', $validated['asset_id'])
            ->whereIn('status', ['registered', 'triage', 'pending', 'approved', 'in_progress', 'on_hold'])
            ->exists();

        if ($hasOpenWorkOrder) {
            return response()->json([
                'message' => 'Unit ini masih memiliki proses workshop yang belum selesai. Registrasi baru hanya bisa dibuat jika work order sebelumnya sudah selesai.',
            ], 422);
        }

        $wo = WorkOrder::create([
            'asset_id' => $validated['asset_id'],
            'title' => $validated['title'],
            'description' => $validated['description'],
            'status' => 'registered', // Initial status before triage
            'created_by' => $request->user()->id,
            // Provide defaults required by schema
            'code' => 'REG-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
            'type' => 'preventive', // Default, will be updated in triage
            'priority' => 'medium',
            'supervisor_id' => $request->user()->id, // Default, update later
            'wo_source' => 'internal',
        ]);

        WorkOrderStatusLog::create([
            'wo_id' => $wo->id,
            'from_status' => null,
            'to_status' => 'registered',
            'changed_by' => $request->user()->id,
            'changed_at' => now(),
        ]);

        $wo->load('asset:id,name,code');

        NotificationDispatcherService::dispatchToNonOperators(
            'Registrasi Workshop Baru',
            "Operator {$request->user()->name} mendaftarkan unit " . ($wo->asset?->name ?? $wo->asset?->code ?? ('Asset #' . $wo->asset_id)) . '.',
            NotificationDispatcherService::buildRouteTargetPayload([
                'entity_type' => 'work_order',
                'entity_id' => $wo->id,
                'work_order_id' => $wo->id,
                'work_order_code' => $wo->code,
                'asset_id' => $wo->asset_id,
                'status' => $wo->status,
            ], [
                'mobile' => [
                    'route_name' => 'workshop.detail',
                    'route' => '/(tabs)/workshop/detail',
                    'params' => ['work_order_id' => (string) $wo->id],
                ],
                'admin' => [
                    'route_name' => 'work-orders.index',
                    'route' => '/work-orders',
                    'params' => ['work_order_id' => (string) $wo->id],
                ],
            ], '/workshop/detail?work_order_id=' . $wo->id, '/work-orders'),
            'work_order_event'
        );

        return response()->json(['message' => 'Registrasi kedatangan berhasil.', 'work_order' => $wo->load(['asset'])], 201);
    }

    /**
     * @tags Work Orders
     * @summary Triage work order (Mechanic)
     * @description Endpoint for mechanics to approve arrival and assign work order type/priority.
     */
    public function triage(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:preventive,corrective,breakdown,inspection',
            'priority' => 'required|in:low,medium,high,critical',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $workOrder->status;

        $workOrder->update([
            'type' => $validated['type'],
            'priority' => $validated['priority'],
            'status' => 'triage',
        ]);

        WorkOrderStatusLog::create([
            'wo_id' => $workOrder->id,
            'from_status' => $oldStatus,
            'to_status' => 'triage',
            'changed_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
            'changed_at' => now(),
        ]);
        
        // Auto-start process if tracking is enabled and not yet started? 
        // We'll let the user explicitly start step 1 or it starts implicitly.

        return response()->json(['message' => 'Triage berhasil.', 'work_order' => $workOrder->fresh()]);
    }

    public function show(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->load([
            'asset', 'schedule', 'supervisor', 'creator', 'approver',
            'assignees', 'checklists', 'attachments', 'comments.user:id,name',
            'statusLogs.changedBy:id,name', 'partsUsage.sparePart',
            'processAbnormalities',
        ]);

        return response()->json($workOrder);
    }

    public function update(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'sometimes|in:low,medium,high,critical',
            'scheduled_start' => 'nullable|date',
            'scheduled_end' => 'nullable|date',
            'estimated_cost' => 'nullable|numeric|min:0',
            'sap_reference_no' => 'nullable|string|max:64',
            'wo_source' => 'sometimes|in:internal,sap',
        ]);

        if (array_key_exists('sap_reference_no', $validated) && !array_key_exists('wo_source', $validated)) {
            $validated['wo_source'] = !empty($validated['sap_reference_no']) ? 'sap' : 'internal';
        }

        $workOrder->update($validated);

        return response()->json(['message' => 'Work order diperbarui.', 'work_order' => $workOrder->fresh()]);
    }

    public function updateStatus(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:draft,pending,approved,in_progress,on_hold,completed,cancelled',
            'notes' => 'nullable|string',
        ]);

        $oldStatus = $workOrder->status;

        $updates = ['status' => $validated['status']];
        if ($validated['status'] === 'in_progress' && !$workOrder->actual_start) {
            $updates['actual_start'] = now();
        }
        if ($validated['status'] === 'completed') {
            $updates['actual_end'] = now();
            if ($request->has('actual_cost')) {
                $updates['actual_cost'] = $request->actual_cost;
            }
        }

        $workOrder->update($updates);

        WorkOrderStatusLog::create([
            'wo_id' => $workOrder->id,
            'from_status' => $oldStatus,
            'to_status' => $validated['status'],
            'changed_by' => $request->user()->id,
            'notes' => $validated['notes'] ?? null,
            'changed_at' => now(),
        ]);

        return response()->json(['message' => 'Status diperbarui.', 'work_order' => $workOrder->fresh()]);
    }

    public function assign(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'users' => 'required|array',
            'users.*.id' => 'required|exists:users,id',
            'users.*.role' => 'required|in:lead,member,support',
        ]);

        foreach ($validated['users'] as $u) {
            $workOrder->assignees()->syncWithoutDetaching([
                $u['id'] => ['role' => $u['role']],
            ]);
        }

        return response()->json(['message' => 'Teknisi ditambahkan ke work order.']);
    }

    public function approve(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $workOrder->update([
            'status' => 'approved',
            'approved_by' => $request->user()->id,
            'approved_at' => now(),
        ]);

        WorkOrderStatusLog::create([
            'wo_id' => $workOrder->id,
            'from_status' => 'pending',
            'to_status' => 'approved',
            'changed_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Work order disetujui.']);
    }

    public function generateJobcard(Request $request, WorkOrder $workOrder): JsonResponse
    {
        if (! $workOrder->jobcard_no) {
            $workOrder->jobcard_no = 'JC-'.now()->format('Ymd').'-'.strtoupper(Str::random(6));
        }

        $workOrder->update([
            'jobcard_no' => $workOrder->jobcard_no,
            'jobcard_status' => 'generated',
            'jobcard_generated_at' => now(),
        ]);

        return response()->json([
            'message' => 'Jobcard berhasil digenerate.',
            'work_order' => $workOrder->fresh(),
        ]);
    }

    public function printJobcard(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_if(! $workOrder->jobcard_no, 422, 'Jobcard belum digenerate.');

        $workOrder->update([
            'jobcard_status' => 'printed',
            'jobcard_printed_at' => now(),
        ]);

        return response()->json([
            'message' => 'Jobcard ditandai sudah dicetak.',
            'work_order' => $workOrder->fresh(),
        ]);
    }

    public function acknowledgeJobcard(Request $request, WorkOrder $workOrder): JsonResponse
    {
        abort_if(! $workOrder->jobcard_no, 422, 'Jobcard belum digenerate.');
        abort_if($workOrder->jobcard_status === 'draft', 422, 'Jobcard masih draft.');

        $workOrder->update([
            'jobcard_status' => 'acknowledged',
            'jobcard_acknowledged_at' => now(),
        ]);

        return response()->json([
            'message' => 'Jobcard di-acknowledge.',
            'work_order' => $workOrder->fresh(),
        ]);
    }

    public function toggleChecklist(Request $request, WorkOrder $workOrder, int $itemId): JsonResponse
    {
        $item = $workOrder->checklists()->findOrFail($itemId);
        $item->update([
            'is_done' => !$item->is_done,
            'done_by' => $item->is_done ? null : $request->user()->id,
            'done_at' => $item->is_done ? null : now(),
        ]);

        return response()->json(['message' => 'Checklist diperbarui.', 'item' => $item->fresh()]);
    }

    public function addAttachment(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:jpg,jpeg,png,webp,pdf,doc,docx,xls,xlsx|max:20480',
            'type' => 'nullable|in:photo,document,video,other',
        ]);

        $file = $request->file('file');
        $disk = Storage::disk('s3');
        $path = $disk->putFile("work-orders/{$workOrder->id}", $file);
        if (!is_string($path) || trim($path) === '') {
            throw new \RuntimeException('Upload attachment ke MinIO gagal.');
        }

        $attachment = $workOrder->attachments()->create([
            'file_path' => $path,
            'file_name' => $file->getClientOriginalName(),
            'type' => $request->type ?? 'photo',
            'uploaded_by' => $request->user()->id,
        ]);

        $rawUrl = (string) $disk->url($path);
        $host = parse_url($rawUrl, PHP_URL_HOST) ?: '';
        $fileUrl = $rawUrl;
        if ($host === 'minio' || str_ends_with($host, '.minio')) {
            $bucket = (string) Config::get('filesystems.disks.s3.bucket', '');
            $publicBase = rtrim((string) env('MINIO_PUBLIC_URL', 'http://localhost:9000'), '/');
            $fileUrl = $publicBase . '/' . $bucket . '/' . ltrim($path, '/');
        }

        return response()->json([
            'message' => 'File diupload.',
            'attachment' => [
                ...$attachment->toArray(),
                'file_url' => $fileUrl,
            ],
        ], 201);
    }

    public function addComment(Request $request, WorkOrder $workOrder): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);

        $comment = $workOrder->comments()->create([
            'user_id' => $request->user()->id,
            'message' => $validated['message'],
        ]);

        return response()->json(['message' => 'Komentar ditambahkan.', 'comment' => $comment->load('user:id,name')], 201);
    }

    public function exportPdf(WorkOrder $workOrder): JsonResponse
    {
        return response()->json(['message' => 'PDF sedang digenerate.', 'url' => null], 202);
    }

    public function breakdown(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'description' => 'required|string',
            'geolat' => 'nullable|numeric',
            'geolng' => 'nullable|numeric',
        ]);

        $approvalTemplate = $request->attributes->get('approval.template');

        $wo = DB::transaction(function () use ($validated, $request, $approvalTemplate) {
            $initialStatus = $approvalTemplate ? 'draft' : 'pending';

            $wo = WorkOrder::create([
                'code' => 'BD-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
                'wo_source' => 'internal',
                'asset_id' => $validated['asset_id'],
                'type' => 'breakdown',
                'priority' => 'critical',
                'title' => 'Breakdown Darurat - ' . now()->format('d/m/Y H:i'),
                'description' => $validated['description'],
                'status' => $initialStatus,
                'supervisor_id' => $request->user()->id,
                'created_by' => $request->user()->id,
            ]);

            if (! $approvalTemplate) {
                \App\Models\Asset::find($validated['asset_id'])->update(['status' => 'breakdown']);
            }

            WorkOrderStatusLog::create([
                'wo_id' => $wo->id,
                'from_status' => null,
                'to_status' => $initialStatus,
                'changed_by' => $request->user()->id,
                'notes' => $approvalTemplate ? 'Menunggu approval template.' : null,
            ]);

            if ($approvalTemplate) {
                $this->approvalWorkflowService->createApprovalRequest(
                    $approvalTemplate,
                    WorkOrder::class,
                    (int) $wo->id,
                    (int) $request->user()->id,
                    [
                        'code' => $wo->code,
                        'asset_id' => $wo->asset_id,
                        'type' => $wo->type,
                    ],
                    [
                        'route_key' => $request->attributes->get('approval.route_key'),
                    ]
                );
            }

            return $wo;
        });

        return response()->json([
            'message' => $approvalTemplate
                ? 'Laporan breakdown diterima dan menunggu approval.'
                : 'Laporan breakdown dikirim.',
            'approval_required' => (bool) $approvalTemplate,
            'work_order' => $wo,
        ], 201);
    }
}
