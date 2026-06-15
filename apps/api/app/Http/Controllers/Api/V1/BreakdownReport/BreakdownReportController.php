<?php

namespace App\Http\Controllers\Api\V1\BreakdownReport;

use App\Http\Controllers\Api\V1\WorkOrder\WorkOrderController;
use App\Http\Controllers\Controller;
use App\Models\BreakdownReport;
use App\Services\Approval\ApprovalWorkflowService;
use App\Services\Notification\NotificationDispatcherService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BreakdownReportController extends Controller
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $query = BreakdownReport::query()->with(['asset:id,name,code', 'workOrder:id,code,status', 'reporter:id,name']);

        if ($request->has('mine') && $request->boolean('mine')) {
            $query->where('reporter_id', $request->user()->id);
        }

        if ($request->filled('asset_id')) {
            $query->where('asset_id', $request->integer('asset_id'));
        }
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }
        if ($request->filled('search')) {
            $search = (string) $request->search;
            $query->where(function ($scoped) use ($search) {
                $scoped->whereHas('asset', function ($assetQuery) use ($search) {
                    $assetQuery->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")
                        ->orWhere('plate_number', 'like', "%{$search}%")
                        ->orWhere('veh_plate_no', 'like', "%{$search}%");
                })->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('location_label', 'like', "%{$search}%");
            });
        }
        if ($request->filled('from')) {
            $query->whereDate('created_at', '>=', $request->from);
        }
        if ($request->filled('to')) {
            $query->whereDate('created_at', '<=', $request->to);
        }

        return response()->json($query->latest()->paginate($request->integer('per_page', 20)));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => ['required', 'exists:assets,id'],
            'description' => ['required', 'string', 'max:5000'],
            'location_label' => ['nullable', 'string', 'max:255'],
        ]);

        $approvalTemplate = $request->attributes->get('approval.template');

        $report = DB::transaction(function () use ($validated, $request, $approvalTemplate) {
            $report = BreakdownReport::create([
                'report_no' => 'BDR-' . now()->format('ymd') . '-' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT),
                'asset_id' => $validated['asset_id'],
                'reporter_id' => $request->user()->id,
                'location_label' => $validated['location_label'] ?? null,
                'description' => $validated['description'],
                'status' => $approvalTemplate ? 'in_review' : 'submitted',
            ]);

            if ($approvalTemplate) {
                $this->approvalWorkflowService->createApprovalRequest(
                    $approvalTemplate,
                    BreakdownReport::class,
                    (int) $report->id,
                    (int) $request->user()->id,
                    [
                        'report_no' => $report->report_no,
                        'asset_id' => $report->asset_id,
                    ],
                    [
                        'route_key' => $request->attributes->get('approval.route_key'),
                    ]
                );
            }

            return $report;
        });

        NotificationDispatcherService::dispatchToNonOperators(
            'Laporan Breakdown Baru',
            'Laporan ' . $report->report_no . ' menunggu tindak lanjut.',
            NotificationDispatcherService::buildRouteTargetPayload([
                'route' => '/breakdown-reports',
                'entity_type' => 'breakdown_report',
                'entity_id' => $report->id,
                'report_no' => $report->report_no,
                'asset_id' => $report->asset_id,
            ], [
                'mobile' => [
                    'route_name' => 'report.index',
                    'route' => '/(tabs)/report',
                    'params' => ['report_id' => (string) $report->id],
                ],
                'admin' => [
                    'route_name' => 'breakdown-reports.index',
                    'route' => '/breakdown-reports',
                    'params' => ['report_id' => (string) $report->id],
                ],
            ], '/breakdown-reports', '/breakdown-reports'),
            'breakdown_event'
        );

        return response()->json([
            'message' => $approvalTemplate
                ? 'Laporan breakdown berhasil dibuat dan menunggu approval.'
                : 'Laporan breakdown berhasil dibuat.',
            'approval_required' => (bool) $approvalTemplate,
            'data' => $report->load(['asset:id,name,code']),
        ], 201);
    }

    public function show(BreakdownReport $breakdownReport): JsonResponse
    {
        return response()->json($breakdownReport->load(['asset:id,name,code', 'workOrder:id,code,status', 'reporter:id,name']));
    }

    public function update(Request $request, BreakdownReport $breakdownReport): JsonResponse
    {
        $validated = $request->validate([
            'description' => ['sometimes', 'string', 'max:5000'],
            'location_label' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', 'in:submitted,in_review,processed,done,cancelled'],
        ]);

        $isReporter = (int) $breakdownReport->reporter_id === (int) $request->user()->id;
        $isPrivileged = $request->user()->can('create work-orders')
            || $request->user()->can('approve work-orders')
            || $request->user()->can('manage settings');

        abort_unless($isReporter || $isPrivileged, 403, 'Anda tidak dapat mengubah laporan ini.');

        if (array_key_exists('status', $validated) && ! $isPrivileged) {
            unset($validated['status']);
        }

        $breakdownReport->update($validated);

        if (array_key_exists('status', $validated) && in_array($validated['status'], ['processed', 'done', 'cancelled'], true)) {
            NotificationDispatcherService::dispatchToUser(
                (int) $breakdownReport->reporter_id,
                'Laporan Breakdown Ditanggapi',
                'Laporan ' . $breakdownReport->report_no . ' telah mendapatkan feedback.',
                NotificationDispatcherService::buildRouteTargetPayload([
                    'entity_type' => 'breakdown_report',
                    'entity_id' => $breakdownReport->id,
                    'status' => $validated['status'],
                ], [
                    'mobile' => [
                        'route_name' => 'report.index',
                        'route' => '/(tabs)/report',
                        'params' => ['report_id' => (string) $breakdownReport->id],
                    ],
                    'admin' => [
                        'route_name' => 'breakdown-reports.index',
                        'route' => '/breakdown-reports',
                        'params' => ['report_id' => (string) $breakdownReport->id],
                    ],
                ], '/report', '/breakdown-reports'),
                'breakdown_event'
            );
        }

        return response()->json([
            'message' => 'Laporan breakdown berhasil diperbarui.',
            'data' => $breakdownReport->fresh()->load(['asset:id,name,code', 'workOrder:id,code,status']),
        ]);
    }

    public function destroy(Request $request, BreakdownReport $breakdownReport): JsonResponse
    {
        abort_unless((int) $breakdownReport->reporter_id === (int) $request->user()->id, 403, 'Anda tidak dapat menghapus laporan ini.');

        $breakdownReport->delete();

        return response()->json(['message' => 'Laporan breakdown berhasil dihapus.']);
    }

    public function process(Request $request, BreakdownReport $breakdownReport, WorkOrderController $workOrderController): JsonResponse
    {
        $breakdownRequest = $request->duplicate(
            [],
            [
                'asset_id' => $breakdownReport->asset_id,
                'description' => $breakdownReport->description,
            ]
        );
        $breakdownRequest->replace([
            'asset_id' => $breakdownReport->asset_id,
            'description' => $breakdownReport->description,
        ]);
        $breakdownRequest->setUserResolver(fn () => $request->user());
        $breakdownRequest->attributes->add($request->attributes->all());

        $response = $workOrderController->breakdown($breakdownRequest);

        $payload = $response->getData(true);
        $workOrderId = $payload['work_order']['id'] ?? null;

        if ($workOrderId) {
            $breakdownReport->update([
                'status' => 'processed',
                'work_order_id' => $workOrderId,
            ]);
        }

        return response()->json([
            'message' => 'Laporan breakdown diproses menjadi Work Order.',
            'data' => $breakdownReport->fresh()->load(['asset:id,name,code', 'workOrder:id,code,status']),
        ]);
    }
}
