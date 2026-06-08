<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Services\Approval\ApprovalDecisionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    public function __construct(private readonly ApprovalDecisionService $approvalDecisionService)
    {
    }

    private function templateRowsResponse($rows): JsonResponse
    {
        $payload = $rows->toArray();
        $payload['items'] = $payload['data'] ?? [];

        return response()->json($payload);
    }

    private function normalizeReferenceTypeFilter(?string $type): ?array
    {
        $raw = trim((string) $type);
        if ($raw === '') {
            return null;
        }

        return match ($raw) {
            'App\\Models\\P2h',
            'App\\Models\\P2H',
            'App\\Models\\P2hSubmission' => ['App\\Models\\P2hSubmission'],
            default => [$raw],
        };
    }

    private function normalizeInboxRow(object $row): array
    {
        $referenceType = (string) ($row->reference_type ?? '');
        $requesterName = $row->submitted_by_name ?? null;
        $currentStepName = $row->step_name ?? null;

        return [
            'approval_request_id' => $row->approval_request_id,
            'id' => $row->approval_request_id,
            'route_key' => $row->route_key,
            'reference_type' => $referenceType,
            'reference_type_label' => str_contains($referenceType, '\\')
                ? class_basename($referenceType)
                : $referenceType,
            'reference_id' => $row->reference_id,
            'submitted_at' => $row->submitted_at,
            'created_at' => $row->submitted_at,
            'step_order' => $row->step_order,
            'step_name' => $currentStepName,
            'current_step_name' => $currentStepName,
            'current_step' => [
                'name' => $currentStepName,
                'order' => $row->step_order,
            ],
            'template_code' => $row->template_code,
            'template_name' => $row->template_name,
            'submitted_by_name' => $requesterName,
            'requester' => [
                'name' => $requesterName,
            ],
        ];
    }

    private function normalizeRequestRow(object $row): array
    {
        $referenceType = (string) ($row->reference_type ?? '');
        $currentStepName = $row->current_step_name ?? null;
        $submittedAt = $row->submitted_at ?? null;

        return [
            'id' => $row->id,
            'route_key' => $row->route_key,
            'reference_type' => $referenceType,
            'reference_type_label' => str_contains($referenceType, '\\')
                ? class_basename($referenceType)
                : $referenceType,
            'reference_id' => $row->reference_id,
            'status' => $row->status,
            'current_step_order' => $row->current_step_order,
            'current_step_name' => $currentStepName,
            'current_step' => [
                'name' => $currentStepName,
                'order' => $row->current_step_order,
            ],
            'submitted_at' => $submittedAt,
            'created_at' => $submittedAt,
            'finalized_at' => $row->finalized_at,
            'template_code' => $row->template_code,
            'template_name' => $row->template_name,
            'submitted_by_name' => $row->submitted_by_name,
            'requester' => [
                'name' => $row->submitted_by_name,
            ],
        ];
    }

    public function templates(Request $request): JsonResponse
    {
        $rows = DB::table('approval_templates')
            ->when($request->filled('route_key'), fn ($q) => $q->where('route_key', $request->string('route_key')))
            ->when($request->filled('module_code'), fn ($q) => $q->where('module_code', $request->string('module_code')))
            ->orderBy('module_code')
            ->orderBy('code')
            ->paginate($request->integer('per_page', 20));

        return $this->templateRowsResponse($rows);
    }

    public function upsertTemplate(Request $request, ?int $templateId = null): JsonResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:80',
            'name' => 'required|string|max:150',
            'module_code' => 'nullable|string|max:80',
            'route_key' => 'required|string|max:150',
            'target_model_type' => 'nullable|string|max:150',
            'target_action' => 'required|string|max:50',
            'approval_mode' => 'required|in:single,parallel,sequential',
            'min_approvals_total' => 'required|integer|min:1|max:20',
            'is_active' => 'required|boolean',
            'effective_from' => 'nullable|date',
            'effective_until' => 'nullable|date',
            'auto_approve_outside_window' => 'required|boolean',
            'conditions_json' => 'nullable|array',
            'notes' => 'nullable|string',
        ]);

        if ($templateId) {
            DB::table('approval_templates')->where('id', $templateId)->update([
                ...$validated,
                'conditions_json' => isset($validated['conditions_json']) ? json_encode($validated['conditions_json']) : null,
                'updated_at' => now(),
            ]);
            return response()->json(['message' => 'Template approval diperbarui.']);
        }

        $id = DB::table('approval_templates')->insertGetId([
            ...$validated,
            'conditions_json' => isset($validated['conditions_json']) ? json_encode($validated['conditions_json']) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        return response()->json(['message' => 'Template approval dibuat.', 'id' => $id], 201);
    }

    public function steps(int $templateId): JsonResponse
    {
        $rows = DB::table('approval_template_steps')
            ->where('template_id', $templateId)
            ->orderBy('step_order')
            ->get()
            ->map(function ($step) {
                $users = DB::table('approval_template_step_users as x')
                    ->join('users as u', 'u.id', '=', 'x.user_id')
                    ->where('x.template_step_id', $step->id)
                    ->select('u.id', 'u.name', 'u.email')
                    ->orderBy('u.name')
                    ->get();
                return [
                    ...((array) $step),
                    'users' => $users,
                ];
            });

        return response()->json(['data' => $rows]);
    }

    public function upsertStep(Request $request, int $templateId, ?int $stepId = null): JsonResponse
    {
        $validated = $request->validate([
            'step_order' => 'required|integer|min:1|max:50',
            'step_name' => 'required|string|max:150',
            'assignment_mode' => 'required|in:fixed_users,manual_users',
            'min_approvals_required' => 'required|integer|min:1|max:20',
            'allow_self_approval' => 'required|boolean',
            'sla_hours' => 'nullable|integer|min:1|max:720',
            'is_active' => 'required|boolean',
            'conditions_json' => 'nullable|array',
        ]);

        if ($stepId) {
            DB::table('approval_template_steps')
                ->where('id', $stepId)
                ->where('template_id', $templateId)
                ->update([
                    ...$validated,
                    'conditions_json' => isset($validated['conditions_json']) ? json_encode($validated['conditions_json']) : null,
                    'updated_at' => now(),
                ]);

            return response()->json(['message' => 'Step approval diperbarui.']);
        }

        $id = DB::table('approval_template_steps')->insertGetId([
            'template_id' => $templateId,
            ...$validated,
            'conditions_json' => isset($validated['conditions_json']) ? json_encode($validated['conditions_json']) : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['message' => 'Step approval dibuat.', 'id' => $id], 201);
    }

    public function replaceStepUsers(Request $request, int $templateId, int $stepId): JsonResponse
    {
        $validated = $request->validate([
            'user_ids' => 'required|array|min:1',
            'user_ids.*' => 'integer|exists:users,id',
        ]);

        $exists = DB::table('approval_template_steps')
            ->where('id', $stepId)
            ->where('template_id', $templateId)
            ->exists();
        abort_unless($exists, 404, 'Step template tidak ditemukan.');

        DB::transaction(function () use ($validated, $stepId) {
            DB::table('approval_template_step_users')->where('template_step_id', $stepId)->delete();
            foreach ($validated['user_ids'] as $userId) {
                DB::table('approval_template_step_users')->insert([
                    'template_step_id' => $stepId,
                    'user_id' => $userId,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        });

        return response()->json(['message' => 'Approver step berhasil diperbarui.']);
    }

    public function requests(Request $request): JsonResponse
    {
        $rows = DB::table('approval_requests as r')
            ->join('approval_templates as t', 't.id', '=', 'r.template_id')
            ->leftJoin('users as u', 'u.id', '=', 'r.submitted_by')
            ->leftJoin('approval_request_steps as ars', function ($join) {
                $join->on('ars.approval_request_id', '=', 'r.id')
                    ->on('ars.step_order', '=', 'r.current_step_order');
            })
            ->select(
                'r.id',
                'r.route_key',
                'r.reference_type',
                'r.reference_id',
                'r.status',
                'r.current_step_order',
                'r.submitted_at',
                'r.finalized_at',
                't.code as template_code',
                't.name as template_name',
                'u.name as submitted_by_name',
                'ars.step_name as current_step_name'
            )
            ->when($request->filled('status'), fn ($q) => $q->where('r.status', $request->string('status')))
            ->when($request->filled('route_key'), fn ($q) => $q->where('r.route_key', $request->string('route_key')))
            ->when($request->filled('from'), fn ($q) => $q->whereDate('r.submitted_at', '>=', $request->from))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('r.submitted_at', '<=', $request->to))
            ->orderByDesc('r.id')
            ->paginate($request->integer('per_page', 20));

        $rows->setCollection(
            $rows->getCollection()->map(fn ($row) => $this->normalizeRequestRow($row))
        );

        return response()->json($rows);
    }

    public function inbox(Request $request): JsonResponse
    {
        $uid = (int) $request->user()->id;
        $typeFilter = $this->normalizeReferenceTypeFilter($request->input('type'));
        $rows = DB::table('approval_request_steps as rs')
            ->join('approval_requests as r', 'r.id', '=', 'rs.approval_request_id')
            ->join('approval_templates as t', 't.id', '=', 'r.template_id')
            ->leftJoin('users as u', 'u.id', '=', 'r.submitted_by')
            ->where('r.status', 'pending')
            ->where('rs.status', 'pending')
            ->whereRaw('JSON_CONTAINS(rs.approver_snapshot_json, JSON_ARRAY(?))', [$uid])
            ->select(
                'r.id as approval_request_id',
                'r.route_key',
                'r.reference_type',
                'r.reference_id',
                'r.submitted_at',
                'rs.step_order',
                'rs.step_name',
                't.code as template_code',
                't.name as template_name',
                'u.name as submitted_by_name'
            )
            ->when($request->filled('from'), fn ($q) => $q->whereDate('r.submitted_at', '>=', $request->from))
            ->when($request->filled('to'), fn ($q) => $q->whereDate('r.submitted_at', '<=', $request->to))
            ->when($typeFilter, fn ($q) => $q->whereIn('r.reference_type', $typeFilter))
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = trim((string) $request->input('search'));
                $q->where(function ($sub) use ($needle) {
                    $sub->where('r.route_key', 'like', "%{$needle}%")
                        ->orWhere('t.code', 'like', "%{$needle}%")
                        ->orWhere('t.name', 'like', "%{$needle}%")
                        ->orWhereRaw('CAST(r.reference_id AS CHAR) like ?', ["%{$needle}%"]);
                });
            })
            ->orderBy('r.submitted_at')
            ->paginate($request->integer('per_page', 20));

        $rows->setCollection(
            $rows->getCollection()->map(fn ($row) => $this->normalizeInboxRow($row))
        );

        return response()->json($rows);
    }

    public function requestDetail(int $requestId): JsonResponse
    {
        $req = DB::table('approval_requests')->where('id', $requestId)->first();
        abort_unless($req, 404, 'Approval request tidak ditemukan.');

        $steps = DB::table('approval_request_steps')->where('approval_request_id', $requestId)->orderBy('step_order')->get();
        $decisions = DB::table('approval_decisions as d')
            ->join('users as u', 'u.id', '=', 'd.approver_user_id')
            ->where('d.approval_request_id', $requestId)
            ->select('d.*', 'u.name as approver_name', 'u.email as approver_email')
            ->orderBy('d.id')
            ->get();

        return response()->json([
            'request' => $req,
            'steps' => $steps,
            'decisions' => $decisions,
        ]);
    }

    public function decide(Request $request, int $requestId): JsonResponse
    {
        $rawAction = trim((string) $request->input('action'));
        $resolvedDecision = match ($rawAction) {
            'approve' => 'approved',
            'reject' => 'rejected',
            default => $request->input('decision'),
        };

        $request->merge([
            'decision' => $resolvedDecision,
        ]);

        $validated = $request->validate([
            'decision' => 'required|in:approved,rejected',
            'notes' => 'nullable|string|max:5000',
        ]);

        $result = $this->approvalDecisionService->decide(
            $requestId,
            (int) $request->user()->id,
            $validated['decision'],
            $validated['notes'] ?? null
        );

        return response()->json([
            'message' => 'Keputusan approval berhasil disimpan.',
            'data' => $result,
        ]);
    }
}
