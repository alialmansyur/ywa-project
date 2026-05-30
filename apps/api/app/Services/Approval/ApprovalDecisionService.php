<?php

namespace App\Services\Approval;

use App\Models\Asset;
use App\Models\BreakdownReport;
use App\Models\Finding;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\WorkOrder;
use App\Models\WorkOrderStatusLog;
use App\Services\Notification\NotificationDispatcherService;
use Illuminate\Support\Facades\DB;

class ApprovalDecisionService
{
    public function decide(int $approvalRequestId, int $actorUserId, string $decision, ?string $notes = null): array
    {
        return DB::transaction(function () use ($approvalRequestId, $actorUserId, $decision, $notes) {
            $request = DB::table('approval_requests')->where('id', $approvalRequestId)->lockForUpdate()->first();
            abort_unless($request, 404, 'Approval request tidak ditemukan.');
            abort_unless($request->status === 'pending', 422, 'Approval request sudah finalized.');

            $step = DB::table('approval_request_steps')
                ->where('approval_request_id', $request->id)
                ->where('step_order', $request->current_step_order)
                ->lockForUpdate()
                ->first();
            abort_unless($step, 422, 'Current approval step tidak valid.');

            $approvers = json_decode((string) ($step->approver_snapshot_json ?? '[]'), true) ?: [];
            abort_unless(in_array($actorUserId, $approvers, true), 403, 'Anda bukan approver untuk step ini.');

            DB::table('approval_decisions')->updateOrInsert(
                [
                    'approval_request_id' => $request->id,
                    'approval_request_step_id' => $step->id,
                    'approver_user_id' => $actorUserId,
                ],
                [
                    'decision' => $decision,
                    'notes' => $notes,
                    'decided_at' => now(),
                    'metadata_json' => null,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            $approvedCount = DB::table('approval_decisions')
                ->where('approval_request_step_id', $step->id)
                ->where('decision', 'approved')
                ->count();
            $rejectedCount = DB::table('approval_decisions')
                ->where('approval_request_step_id', $step->id)
                ->where('decision', 'rejected')
                ->count();

            $stepStatus = 'pending';
            if ($rejectedCount > 0) {
                $stepStatus = 'rejected';
            } elseif ($approvedCount >= (int) $step->min_approvals_required) {
                $stepStatus = 'approved';
            }

            DB::table('approval_request_steps')->where('id', $step->id)->update([
                'approved_count' => $approvedCount,
                'rejected_count' => $rejectedCount,
                'status' => $stepStatus,
                'finalized_at' => in_array($stepStatus, ['approved', 'rejected'], true) ? now() : null,
                'decision_notes' => $notes,
                'updated_at' => now(),
            ]);

            $template = DB::table('approval_templates')->where('id', $request->template_id)->first();
            $nextAction = $this->resolveRequestTransition($request, $template, $stepStatus);

            if ($nextAction['type'] === 'advance') {
                DB::table('approval_requests')->where('id', $request->id)->update([
                    'current_step_order' => $nextAction['next_step_order'],
                    'updated_at' => now(),
                ]);
                DB::table('approval_request_steps')
                    ->where('approval_request_id', $request->id)
                    ->where('step_order', $nextAction['next_step_order'])
                    ->update(['started_at' => now(), 'updated_at' => now()]);
            } elseif ($nextAction['type'] === 'finalize') {
                DB::table('approval_requests')->where('id', $request->id)->update([
                    'status' => $nextAction['status'],
                    'finalized_at' => now(),
                    'decision_notes' => $notes,
                    'updated_at' => now(),
                ]);
                $this->applyBusinessEffect((int) $request->id, $nextAction['status']);
            }

            $fresh = DB::table('approval_requests')->where('id', $request->id)->first();
            return (array) $fresh;
        });
    }

    private function resolveRequestTransition(object $request, ?object $template, string $currentStepStatus): array
    {
        if ($currentStepStatus === 'rejected') {
            return ['type' => 'finalize', 'status' => 'rejected'];
        }

        if ($currentStepStatus !== 'approved') {
            return ['type' => 'stay'];
        }

        $steps = DB::table('approval_request_steps')
            ->where('approval_request_id', $request->id)
            ->orderBy('step_order')
            ->get();
        $currentIdx = $steps->search(fn ($x) => (int) $x->step_order === (int) $request->current_step_order);
        $nextStep = $currentIdx !== false ? $steps->get($currentIdx + 1) : null;

        $mode = $template?->approval_mode ?? 'single';
        if ($mode === 'sequential' && $nextStep) {
            return ['type' => 'advance', 'next_step_order' => (int) $nextStep->step_order];
        }

        if ($nextStep && $mode === 'single') {
            return ['type' => 'advance', 'next_step_order' => (int) $nextStep->step_order];
        }

        if ($nextStep && $mode === 'parallel') {
            // For parallel, keep steps concept simple: finalize when all steps approved.
            $pendingOrRejected = $steps->contains(fn ($s) => $s->status !== 'approved');
            if ($pendingOrRejected) {
                return ['type' => 'stay'];
            }
        }

        return ['type' => 'finalize', 'status' => 'approved'];
    }

    private function applyBusinessEffect(int $approvalRequestId, string $finalStatus): void
    {
        $request = DB::table('approval_requests')->where('id', $approvalRequestId)->first();
        if (!$request) {
            return;
        }

        if ($finalStatus === 'approved') {
            $this->applyApproved($request);
            return;
        }

        $this->applyRejected($request);
    }

    private function applyApproved(object $request): void
    {
        if ($request->reference_type === Finding::class) {
            $finding = Finding::find($request->reference_id);
            if (! $finding) {
                return;
            }
            $finding->update(['status' => 'submitted']);
            NotificationDispatcherService::dispatchToUser(
                (int) $finding->reporter_id,
                'Temuan Disetujui',
                'Temuan ' . $finding->code . ' telah disetujui.',
                [
                    'route' => '/findings',
                    'entity_type' => 'finding',
                    'entity_id' => $finding->id,
                    'status' => 'submitted',
                ],
                'finding_event'
            );
            return;
        }

        if ($request->reference_type === BreakdownReport::class) {
            $report = BreakdownReport::find($request->reference_id);
            if (! $report) {
                return;
            }
            $report->update(['status' => 'submitted']);
            NotificationDispatcherService::dispatchToUser(
                (int) $report->reporter_id,
                'Laporan Breakdown Disetujui',
                'Laporan ' . $report->report_no . ' telah disetujui.',
                [
                    'route' => '/report',
                    'entity_type' => 'breakdown_report',
                    'entity_id' => $report->id,
                    'status' => 'submitted',
                ],
                'breakdown_event'
            );
            return;
        }

        if ($request->reference_type === WorkOrder::class) {
            $wo = WorkOrder::find($request->reference_id);
            if (!$wo) {
                return;
            }

            if ($request->route_key === 'mobile.workshop.register') {
                $wo->update(['status' => 'pending']);
                Asset::where('id', $wo->asset_id)->update(['status' => 'breakdown']);
            } elseif ($request->route_key === 'admin.schedule.create-work-order') {
                $wo->update(['status' => 'pending']);
            }

            WorkOrderStatusLog::create([
                'wo_id' => $wo->id,
                'from_status' => 'draft',
                'to_status' => 'pending',
                'changed_by' => $request->submitted_by,
                'notes' => 'Auto transition setelah approval request disetujui.',
                'changed_at' => now(),
            ]);
            return;
        }

        if ($request->reference_type === InventoryTransaction::class) {
            $trx = InventoryTransaction::find($request->reference_id);
            if (!$trx || $trx->approval_status !== 'pending_approval') {
                return;
            }

            $inventory = Inventory::firstOrCreate(
                ['part_id' => $trx->part_id, 'location' => 'gudang-utama'],
                ['qty_available' => 0]
            );
            $delta = in_array($trx->type, ['in', 'return'], true) ? $trx->qty : -$trx->qty;
            $inventory->increment('qty_available', $delta);

            $trx->update([
                'approval_status' => 'approved',
                'applied_at' => now(),
            ]);
        }
    }

    private function applyRejected(object $request): void
    {
        if ($request->reference_type === BreakdownReport::class) {
            $report = BreakdownReport::find($request->reference_id);
            if (! $report) {
                return;
            }
            $report->update(['status' => 'cancelled']);
            NotificationDispatcherService::dispatchToUser(
                (int) $report->reporter_id,
                'Laporan Breakdown Ditolak',
                'Laporan ' . $report->report_no . ' ditolak.',
                [
                    'route' => '/report',
                    'entity_type' => 'breakdown_report',
                    'entity_id' => $report->id,
                    'status' => 'cancelled',
                ],
                'breakdown_event'
            );
            return;
        }

        if ($request->reference_type === Finding::class) {
            $finding = Finding::find($request->reference_id);
            if (! $finding) {
                return;
            }
            $finding->update(['status' => 'in_review']);
            NotificationDispatcherService::dispatchToUser(
                (int) $finding->reporter_id,
                'Temuan Ditolak',
                'Temuan ' . $finding->code . ' ditolak.',
                [
                    'route' => '/findings',
                    'entity_type' => 'finding',
                    'entity_id' => $finding->id,
                    'status' => 'in_review',
                ],
                'finding_event'
            );
            return;
        }

        if ($request->reference_type === WorkOrder::class) {
            WorkOrder::where('id', $request->reference_id)->update(['status' => 'cancelled']);
            return;
        }

        if ($request->reference_type === InventoryTransaction::class) {
            InventoryTransaction::where('id', $request->reference_id)
                ->where('approval_status', 'pending_approval')
                ->update(['approval_status' => 'rejected']);
        }
    }
}
