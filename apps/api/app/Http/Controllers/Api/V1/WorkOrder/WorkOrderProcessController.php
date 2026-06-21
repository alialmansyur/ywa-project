<?php

namespace App\Http\Controllers\Api\V1\WorkOrder;

use App\Http\Controllers\Controller;
use App\Models\WoProcessAbnormality;
use App\Models\WoProcessEvent;
use App\Models\WoProcessTemplate;
use App\Models\WorkOrder;
use App\Services\WorkOrder\WorkOrderProcessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * @tags Work Orders - Process Tracking
 */
class WorkOrderProcessController extends Controller
{
    public function __construct(private readonly WorkOrderProcessService $service)
    {
    }

    public function templates(Request $request): JsonResponse
    {
        $templates = WoProcessTemplate::query()
            ->with('steps')
            ->when($request->wo_type, fn ($q) => $q->where('wo_type', $request->string('wo_type')))
            ->where('is_active', true)
            ->orderBy('wo_type')
            ->get();

        return response()->json($templates);
    }

    public function process(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->load([
            'processTemplate.steps',
            'processInstances' => fn ($q) => $q->latest()->with('stepLogs.templateStep'),
        ]);

        return response()->json([
            'work_order_id' => $workOrder->id,
            'status' => $workOrder->status,
            'process_template' => $workOrder->processTemplate,
            'instances' => $workOrder->processInstances,
        ]);
    }

    public function timeline(WorkOrder $workOrder): JsonResponse
    {
        return response()->json($this->service->timeline($workOrder));
    }

    public function metrics(WorkOrder $workOrder): JsonResponse
    {
        $workOrder->load('processStepLogs');

        return response()->json($this->service->metrics($workOrder));
    }

    public function start(WorkOrder $workOrder, Request $request): JsonResponse
    {
        $instance = $this->service->startProcess($workOrder, $request->user());

        return response()->json([
            'message' => 'Process WO dimulai.',
            'instance' => $instance,
        ]);
    }

    public function stepIn(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $step = $this->service->stepIn($workOrder, $stepOrder, $request->user(), $validated['notes'] ?? null);

        return response()->json(['message' => 'Step dimulai.', 'step' => $step]);
    }

    public function stepOut(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'downtime_minutes' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'sap_reference_no' => ['nullable', 'string', 'max:64'],
            'station_data' => ['nullable', 'array'],
            'station_data.step_code' => ['nullable', 'string', 'max:50'],
            'station_data.pre_wash_condition' => ['nullable', 'string', 'max:50'],
            'station_data.post_wash_condition' => ['nullable', 'string', 'max:50'],
            'station_data.post_wash_route' => ['nullable', 'string'],
            'station_data.visual_note' => ['nullable', 'string'],
            'station_data.inspection_result' => ['nullable', 'string', 'max:50'],
            'station_data.work_plan' => ['nullable', 'string', 'max:50'],
            'station_data.inspection_categories' => ['nullable', 'array'],
            'station_data.inspection_categories.*' => ['nullable', 'string', 'max:50'],
            'station_data.main_findings' => ['nullable', 'string'],
            'station_data.action_estimate' => ['nullable', 'string', 'max:100'],
            'station_data.checkpoint_result' => ['nullable', 'string', 'max:50'],
            'station_data.checking_summary' => ['nullable', 'string'],
            'station_data.proceed_status' => ['nullable', 'string', 'max:50'],
            'station_data.waiting_reason' => ['nullable', 'string'],
            'station_data.waiting_type' => ['nullable', 'string', 'max:50'],
            'station_data.waiting_eta' => ['nullable', 'string', 'max:100'],
            'station_data.sap_reference_no' => ['nullable', 'string', 'max:64'],
            'station_data.admin_note' => ['nullable', 'string'],
            'station_data.jobcard_confirmation' => ['nullable', 'string', 'max:50'],
            'station_data.repair_action' => ['nullable', 'string'],
            'station_data.technical_action' => ['nullable', 'string', 'max:50'],
            'station_data.technical_actions' => ['nullable', 'array'],
            'station_data.technical_actions.*' => ['nullable', 'string', 'max:50'],
            'station_data.obstacle' => ['nullable', 'string', 'max:50'],
            'station_data.hold_reason' => ['nullable', 'string'],
            'station_data.qc_result' => ['nullable', 'string', 'max:50'],
            'station_data.qc_parameter' => ['nullable', 'string', 'max:100'],
            'station_data.qc_parameters' => ['nullable', 'array'],
            'station_data.qc_parameters.*' => ['nullable', 'string', 'max:100'],
            'station_data.rework_note' => ['nullable', 'string'],
            'station_data.closing_status' => ['nullable', 'string', 'max:50'],
            'station_data.work_summary' => ['nullable', 'string'],
            'station_data.document_completeness' => ['nullable', 'string', 'max:50'],
            'station_data.handover_confirmation' => ['nullable', 'string', 'max:50'],
            'station_data.receiver' => ['nullable', 'string', 'max:100'],
            'station_data.final_note' => ['nullable', 'string'],
            'station_data.parts_count' => ['nullable', 'integer', 'min:0'],
            'part_required' => ['nullable', 'boolean'],
            'part_items' => ['nullable', 'array'],
            'part_items.*.part_id' => ['required_with:part_items', 'integer', 'exists:spare_parts,id'],
            'part_items.*.qty' => ['nullable', 'numeric', 'min:0.01'],
            'part_items.*.location' => ['nullable', 'string', 'max:100'],
        ]);

        $activeInstance = $workOrder->processInstances()
            ->whereIn('state', ['running', 'hold'])
            ->latest()
            ->first();
        $stepLog = $activeInstance?->stepLogs()->where('step_order', $stepOrder)->first();
        $isCreateWoStep = strtoupper((string) ($stepLog?->step_code ?? '')) === 'CREATE_WO';
        $sapCandidate = trim((string) ($validated['sap_reference_no'] ?? $workOrder->sap_reference_no ?? ''));
        if ($isCreateWoStep && $sapCandidate === '') {
            WoProcessEvent::query()->create([
                'wo_id' => $workOrder->id,
                'event_key' => 'STEP_OUT_REJECTED_MISSING_SAP',
                'source_step_order' => $stepOrder,
                'target_step_order' => null,
                'triggered_by' => $request->user()->id,
                'payload_json' => [
                    'step_code' => 'CREATE_WO',
                    'message' => 'SAP Reference No / WO No harus diisi sebelum menyelesaikan tahap ini.',
                ],
                'triggered_at' => now(),
            ]);

            return response()->json([
                'message' => 'SAP Reference No / WO No harus diisi sebelum menyelesaikan tahap ini.',
                'error_code' => 'STEP_OUT_REJECTED_MISSING_SAP',
            ], 422);
        }

        $step = $this->service->stepOut(
            $workOrder,
            $stepOrder,
            $request->user(),
            $validated['downtime_minutes'] ?? null,
            $validated['notes'] ?? null,
            $validated['sap_reference_no'] ?? null,
            $validated['station_data'] ?? [],
            $validated['part_required'] ?? null,
            $validated['part_items'] ?? [],
        );

        return response()->json(['message' => 'Step selesai.', 'step' => $step]);
    }

    public function approve(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $step = $this->service->approveStep($workOrder, $stepOrder, $request->user(), $validated['notes'] ?? null);

        return response()->json(['message' => 'Step disetujui.', 'step' => $step]);
    }

    public function reject(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $step = $this->service->rejectStep($workOrder, $stepOrder, $request->user(), $validated['reason']);

        return response()->json(['message' => 'Step direject.', 'step' => $step]);
    }

    public function hold(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:500'],
        ]);

        $step = $this->service->holdStep($workOrder, $stepOrder, $request->user(), $validated['reason']);

        return response()->json(['message' => 'Step di-hold.', 'step' => $step]);
    }

    public function resume(WorkOrder $workOrder, int $stepOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $step = $this->service->resumeStep($workOrder, $stepOrder, $request->user(), $validated['notes'] ?? null);

        return response()->json(['message' => 'Step dilanjutkan.', 'step' => $step]);
    }

    public function complete(WorkOrder $workOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'notes' => ['nullable', 'string'],
        ]);

        $instance = $this->service->completeProcess($workOrder, $request->user(), $validated['notes'] ?? null);

        return response()->json([
            'message' => 'Process WO selesai.',
            'instance' => $instance,
        ]);
    }

    public function abnormalities(WorkOrder $workOrder): JsonResponse
    {
        $rows = WoProcessAbnormality::query()
            ->where('wo_id', $workOrder->id)
            ->latest()
            ->get();

        return response()->json($rows);
    }

    public function reportAbnormality(WorkOrder $workOrder, Request $request): JsonResponse
    {
        $validated = $request->validate([
            'category' => ['required', 'string', 'max:100'],
            'severity' => ['required', 'in:low,medium,high,critical'],
            'summary' => ['required', 'string', 'max:255'],
            'details_json' => ['nullable', 'array'],
            'process_instance_id' => ['nullable', 'integer'],
            'step_log_id' => ['nullable', 'integer'],
        ]);

        $row = WoProcessAbnormality::query()->create([
            ...$validated,
            'wo_id' => $workOrder->id,
            'status' => 'open',
            'reported_by' => $request->user()->id,
        ]);

        return response()->json(['message' => 'Abnormality dilaporkan.', 'abnormality' => $row], 201);
    }

    public function resolveAbnormality(WorkOrder $workOrder, int $abnormalityId, Request $request): JsonResponse
    {
        $row = WoProcessAbnormality::query()
            ->where('wo_id', $workOrder->id)
            ->findOrFail($abnormalityId);

        $row->update([
            'status' => 'resolved',
            'resolved_by' => $request->user()->id,
            'resolved_at' => now(),
        ]);

        return response()->json(['message' => 'Abnormality diselesaikan.', 'abnormality' => $row->fresh()]);
    }
}
