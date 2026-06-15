<?php

namespace App\Services\WorkOrder;

use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Models\SparePart;
use App\Models\WoPartsUsage;
use App\Models\WoProcessAbnormality;
use App\Models\WoProcessEvent;
use App\Models\WoProcessInstance;
use App\Models\WoProcessStepLog;
use App\Models\WoProcessTemplate;
use App\Models\WorkOrder;
use App\Models\WorkOrderStatusLog;
use App\Models\User;
use App\Services\Notification\NotificationDispatcherService;
use Illuminate\Support\Facades\DB;

class WorkOrderProcessService
{
    private const POST_WASH_ROUTE_CONTINUE_REPAIR = 'CONTINUE_REPAIR';
    private const POST_WASH_ROUTE_COMPLETE_AFTER_WASH = 'COMPLETE_AFTER_WASH';
    private const AUTO_COMPLETE_AFTER_WASH_NOTE = '[SYSTEM] Auto-complete setelah washing bay.';

    public function getOrCreateTemplateForWorkOrder(WorkOrder $workOrder): ?WoProcessTemplate
    {
        if ($workOrder->processTemplate) {
            return $workOrder->processTemplate;
        }

        $preferredCode = 'WO-WORKSHOP-BAY-'.strtoupper($workOrder->type).'-V1';

        $template = WoProcessTemplate::query()
            ->where('code', $preferredCode)
            ->where('is_active', true)
            ->with('steps')
            ->first();

        if (! $template) {
            $template = WoProcessTemplate::query()
                ->where('wo_type', $workOrder->type)
                ->where('is_active', true)
                ->with('steps')
                ->first();
        }

        if ($template) {
            $workOrder->update(['process_template_id' => $template->id]);
        }

        return $template;
    }

    public function startProcess(WorkOrder $workOrder, User $actor): WoProcessInstance
    {
        return DB::transaction(function () use ($workOrder, $actor) {
            // Flow guard: process can start only after arrival has been approved/triaged.
            $allowedStatuses = ['triage', 'approved', 'pending', 'in_progress'];
            if (! in_array($workOrder->status, $allowedStatuses, true)) {
                $this->reportAbnormality($workOrder, [
                    'category' => 'flow_guard',
                    'severity' => 'high',
                    'summary' => 'Start process ditolak karena status WO: '.$workOrder->status,
                    'details_json' => ['wo_status' => $workOrder->status],
                    'reported_by' => $actor->id,
                ]);
                abort(422, 'WO harus melalui approval kedatangan (minimal status triage) sebelum start process.');
            }

            $template = $this->getOrCreateTemplateForWorkOrder($workOrder);
            abort_if(! $template, 422, 'Template proses untuk tipe WO ini tidak ditemukan.');

            $instance = WoProcessInstance::query()->firstOrCreate(
                ['wo_id' => $workOrder->id, 'state' => 'running'],
                [
                    'template_id' => $template->id,
                    'current_step_order' => null,
                ]
            );

            if (! $instance->wasRecentlyCreated) {
                $this->syncPreWorkshopSteps($workOrder, $instance, $actor);
                return $instance->fresh(['template.steps', 'stepLogs']);
            }

            foreach ($template->steps as $step) {
                WoProcessStepLog::create([
                    'wo_id' => $workOrder->id,
                    'process_instance_id' => $instance->id,
                    'template_step_id' => $step->id,
                    'step_order' => $step->step_order,
                    'step_code' => $step->step_code,
                    'step_name' => $step->step_name,
                    'status' => 'ready',
                    'est_minutes' => $step->sla_minutes,
                ]);
            }

            $firstStep = $instance->stepLogs()->orderBy('step_order')->first();
            $instance->update(['current_step_order' => $firstStep?->step_order]);

            $this->syncPreWorkshopSteps($workOrder, $instance, $actor);

            if (in_array($workOrder->status, ['registered', 'triage', 'approved', 'pending'], true)) {
                $this->setWorkOrderStatus($workOrder, 'in_progress', $actor, 'Process started.');
            }

            $this->addEvent($workOrder, 'PROCESS_STARTED', null, $firstStep?->step_order, $actor->id, []);

            return $instance->fresh(['template.steps', 'stepLogs']);
        });
    }

    public function stepIn(WorkOrder $workOrder, int $stepOrder, User $actor, ?string $notes = null): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $notes) {
            $instance = $this->activeInstance($workOrder);

            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();
            abort_if(! in_array($step->status, ['ready', 'hold'], true), 422, 'Step tidak bisa dimulai dari status saat ini.');

            $runningOther = $instance->stepLogs()
                ->where('status', 'in_progress')
                ->where('id', '!=', $step->id)
                ->exists();

            abort_if($runningOther, 422, 'Masih ada step lain yang sedang berjalan.');

            $bay = $this->resolveBayByStepCode($step->step_code);

            $step->update([
                'status' => 'in_progress',
                'process_in_at' => now(),
                'performed_by' => $actor->id,
                'notes' => $notes,
                'bay_in' => $bay,
                'bay_in_at' => now(),
            ]);

            $instance->update(['current_step_order' => $step->step_order, 'state' => 'running']);

            if (! in_array($workOrder->status, ['completed', 'cancelled'], true)) {
                $this->setWorkOrderStatus($workOrder, 'in_progress', $actor, 'Step in: '.$step->step_name);
            }

            $this->addEvent($workOrder, 'STEP_IN', $step->step_order, $step->step_order, $actor->id, ['step_code' => $step->step_code]);
            if ($bay) {
                $this->addEvent($workOrder, 'BAY_IN', $step->step_order, $step->step_order, $actor->id, ['bay' => $bay]);
            }

            return $step->fresh();
        });
    }

    public function stepOut(WorkOrder $workOrder, int $stepOrder, User $actor, ?int $downtimeMinutes = null, ?string $notes = null, ?string $sapReferenceNo = null, array $stationData = [], ?bool $partRequired = null, array $partItems = []): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $downtimeMinutes, $notes, $sapReferenceNo, $stationData, $partRequired, $partItems) {
            $instance = $this->activeInstance($workOrder);
            $this->syncPreWorkshopSteps($workOrder, $instance, $actor);
            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();

            abort_if($step->status !== 'in_progress', 422, 'Step tidak dalam status in_progress.');
            abort_if(! $step->process_in_at, 422, 'Process in belum tercatat.');
            
            if (! empty($sapReferenceNo)) {
                $workOrder->update([
                    'sap_reference_no' => trim($sapReferenceNo),
                    'wo_source' => 'sap',
                ]);
                $workOrder->refresh();
                $this->addEvent($workOrder, 'SAP_REFERENCE_SET', $step->step_order, $step->step_order, $actor->id, [
                    'sap_reference_no' => $workOrder->sap_reference_no,
                ]);
            }

            $this->validateStationFeedback($step->step_code, $notes, $stationData);

            // Phase 7 Validation
            if ($step->step_code === 'CREATE_WO') {
                abort_if(empty($workOrder->sap_reference_no), 422, 'SAP Reference No / WO No harus diisi sebelum menyelesaikan tahap ini.');
            }

            $outTime = now();
            $actual = max(1, (int) $step->process_in_at->diffInMinutes($outTime));
            $queueMinutes = $step->bay_in_at ? (int) $step->bay_in_at->diffInMinutes($outTime) : null;

            $requiresApproval = (bool) optional($step->templateStep)->requires_approval;
            if ($this->shouldBypassApprovalForWorkshopBay($instance, $step->step_code)) {
                $requiresApproval = false;
            }
            $nextStatus = $requiresApproval ? 'waiting_approval' : 'done';

            $step->update([
                'status' => $nextStatus,
                'process_out_at' => $outTime,
                'actual_minutes' => $actual,
                'downtime_minutes' => $downtimeMinutes,
                'notes' => $notes,
                'bay_out_at' => $outTime,
                'queue_minutes' => $queueMinutes,
            ]);

            $nextStep = null;
            $completedViaWashing = false;
            if (! $requiresApproval) {
                if ($step->step_code === 'UNIT_CHECK_PART_NEED') {
                    $partStep = $instance->stepLogs()->where('step_code', 'PART_SUPPLY')->first();
                    if ($partStep) {
                        if ($partRequired === false) {
                            $partStep->update([
                                'status' => 'skipped',
                                'notes' => 'Auto-skip: part tidak diperlukan.',
                            ]);
                            $this->addEvent($workOrder, 'PART_NOT_REQUIRED', $step->step_order, $partStep->step_order, $actor->id, []);
                        } else {
                            $this->addEvent($workOrder, 'PART_REQUIRED', $step->step_order, $partStep->step_order, $actor->id, []);
                        }
                    }
                }

                if ($this->shouldReservePartsForStep($instance, $step->step_code, $partItems)) {
                    $this->reservePartsForWorkOrder($workOrder, $actor, $partItems);
                }

                if (
                    $step->step_code === 'WASHING_BAY'
                    && (($stationData['post_wash_route'] ?? null) === self::POST_WASH_ROUTE_COMPLETE_AFTER_WASH)
                ) {
                    $completedViaWashing = true;
                    $this->completeRemainingWorkshopStepsAfterWashing($workOrder, $instance, $step, $actor, $outTime);
                } else {
                    $nextStep = $this->activateNextReadyStep($instance, $step, $actor);
                }
            }

            $this->addEvent($workOrder, 'STEP_OUT', $step->step_order, $nextStep?->step_order, $actor->id, [
                'requires_approval' => $requiresApproval,
                'actual_minutes' => $actual,
                'downtime_minutes' => $downtimeMinutes,
                'station_data' => $stationData,
                'completed_via_washing' => $completedViaWashing,
            ]);

            if ($step->bay_in) {
                $this->addEvent($workOrder, 'BAY_OUT', $step->step_order, $nextStep?->step_order, $actor->id, ['bay' => $step->bay_in]);
            }

            return $step->fresh();
        });
    }

    public function approveStep(WorkOrder $workOrder, int $stepOrder, User $actor, ?string $notes = null): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $notes) {
            $instance = $this->activeInstance($workOrder);
            $this->syncPreWorkshopSteps($workOrder, $instance, $actor);
            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();

            abort_if($step->status !== 'waiting_approval', 422, 'Step tidak menunggu approval.');

            $step->update([
                'status' => 'done',
                'approved_by' => $actor->id,
                'notes' => $notes,
            ]);

            $nextStep = $this->activateNextReadyStep($instance, $step, $actor);
            if ($step->step_code === 'QC_CHECK') {
                $this->addEvent($workOrder, 'QC_OK', $step->step_order, $nextStep?->step_order, $actor->id, []);
            }
            $this->addEvent($workOrder, 'STEP_APPROVED', $step->step_order, $nextStep?->step_order, $actor->id, []);

            return $step->fresh();
        });
    }

    public function rejectStep(WorkOrder $workOrder, int $stepOrder, User $actor, string $reason): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $reason) {
            $instance = $this->activeInstance($workOrder);
            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();

            abort_if(! in_array($step->status, ['waiting_approval', 'in_progress'], true), 422, 'Step tidak bisa direject.');

            $step->update([
                'status' => 'rejected',
                'reject_reason' => $reason,
                'notes' => $reason,
            ]);

            if ($step->step_code === 'QC_CHECK') {
                $serviceStep = $instance->stepLogs()->where('step_code', 'SERVICE_REPAIR')->first();
                if ($serviceStep) {
                    $serviceStep->update([
                        'status' => 'ready',
                        'process_in_at' => null,
                        'process_out_at' => null,
                        'actual_minutes' => null,
                        'downtime_minutes' => null,
                        'bay_out_at' => null,
                        'queue_minutes' => null,
                        'rework_count' => (int) $serviceStep->rework_count + 1,
                        'notes' => 'Rework setelah QC NOT_OK',
                    ]);
                    $instance->update(['current_step_order' => $serviceStep->step_order, 'state' => 'running']);
                    $this->addEvent($workOrder, 'QC_NOT_OK', $step->step_order, $serviceStep->step_order, $actor->id, ['reason' => $reason]);
                    $this->addEvent($workOrder, 'ROUTE_TO_SERVICE_REWORK', $step->step_order, $serviceStep->step_order, $actor->id, []);
                }
            }

            $this->setWorkOrderStatus($workOrder, 'on_hold', $actor, 'Step rejected: '.$step->step_name);
            $this->addEvent($workOrder, 'STEP_REJECTED', $step->step_order, null, $actor->id, ['reason' => $reason]);

            return $step->fresh();
        });
    }

    public function holdStep(WorkOrder $workOrder, int $stepOrder, User $actor, string $reason): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $reason) {
            $instance = $this->activeInstance($workOrder);
            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();

            abort_if($step->status !== 'in_progress', 422, 'Hanya step in_progress yang bisa di-hold.');

            $step->update([
                'status' => 'hold',
                'notes' => $reason,
            ]);

            \App\Models\WoProcessStepDowntime::create([
                'wo_process_step_log_id' => $step->id,
                'wo_id' => $workOrder->id,
                'hold_start_at' => now(),
                'reason' => $reason,
                'held_by' => $actor->id,
            ]);

            $instance->update(['state' => 'hold']);
            $this->setWorkOrderStatus($workOrder, 'on_hold', $actor, 'Step hold: '.$reason);
            $this->addEvent($workOrder, 'STEP_HOLD', $step->step_order, $step->step_order, $actor->id, ['reason' => $reason]);

            return $step->fresh();
        });
    }

    public function resumeStep(WorkOrder $workOrder, int $stepOrder, User $actor, ?string $notes = null): WoProcessStepLog
    {
        return DB::transaction(function () use ($workOrder, $stepOrder, $actor, $notes) {
            $instance = $this->activeInstance($workOrder);
            $step = $instance->stepLogs()->where('step_order', $stepOrder)->firstOrFail();

            abort_if($step->status !== 'hold', 422, 'Step tidak dalam status hold.');

            $downtime = \App\Models\WoProcessStepDowntime::where('wo_process_step_log_id', $step->id)
                ->whereNull('hold_end_at')
                ->latest('hold_start_at')
                ->first();

            $duration = 0;
            if ($downtime) {
                $endAt = now();
                $duration = $endAt->diffInMinutes($downtime->hold_start_at);
                $downtime->update([
                    'hold_end_at' => $endAt,
                    'duration_minutes' => $duration,
                    'resumed_by' => $actor->id,
                ]);
            }

            $step->update([
                'status' => 'in_progress',
                'notes' => $notes ?? $step->notes,
            ]);

            // Assuming WoProcessStepLog has downtime_minutes column
            $step->increment('downtime_minutes', $duration);

            $instance->update(['state' => 'running', 'current_step_order' => $step->step_order]);
            $this->setWorkOrderStatus($workOrder, 'in_progress', $actor, 'Step resumed: '.$step->step_name);
            $this->addEvent($workOrder, 'STEP_RESUME', $step->step_order, $step->step_order, $actor->id, []);

            return $step->fresh();
        });
    }

    public function completeProcess(WorkOrder $workOrder, User $actor, ?string $notes = null): WoProcessInstance
    {
        return DB::transaction(function () use ($workOrder, $actor, $notes) {
            if (! in_array($workOrder->status, ['in_progress', 'on_hold'], true)) {
                $this->reportAbnormality($workOrder, [
                    'category' => 'flow_guard',
                    'severity' => 'high',
                    'summary' => 'Complete process ditolak karena status WO belum in_progress/on_hold.',
                    'details_json' => ['wo_status' => $workOrder->status],
                    'reported_by' => $actor->id,
                ]);
                abort(422, 'WO hanya bisa di-complete setelah masuk fase in_progress/on_hold.');
            }

            // Jobcard gate is optional for new 11-step flow
            // Only enforce if jobcard was generated
            if ($workOrder->jobcard_no && $workOrder->jobcard_status !== 'acknowledged') {
                $this->reportAbnormality($workOrder, [
                    'category' => 'close_gate',
                    'severity' => 'medium',
                    'summary' => 'Jobcard sudah digenerate tapi belum acknowledged.',
                    'details_json' => ['jobcard_status' => $workOrder->jobcard_status],
                    'reported_by' => $actor->id,
                ]);
                // Don't abort, just log abnormality
            }

            $instance = $this->activeInstance($workOrder);

            $partSupplyStep = $instance->stepLogs()->where('step_code', 'PART_SUPPLY')->first();
            if ($partSupplyStep && $partSupplyStep->status === 'done') {
                $hasUsage = WoPartsUsage::query()->where('wo_id', $workOrder->id)->exists();
                if (! $hasUsage) {
                    $this->reportAbnormality($workOrder, [
                        'category' => 'close_gate',
                        'severity' => 'critical',
                        'summary' => 'Complete process ditolak karena PART_SUPPLY selesai namun belum ada reservasi/pemakaian part.',
                        'details_json' => ['step_code' => 'PART_SUPPLY'],
                        'reported_by' => $actor->id,
                    ]);
                    abort(422, 'PART_SUPPLY sudah done tetapi data part usage/reservasi belum ada.');
                }
            }

            $pendingMandatory = $instance->stepLogs()
                ->whereHas('templateStep', fn ($q) => $q->where('is_mandatory', true))
                ->whereNotIn('status', ['done', 'skipped'])
                ->exists();

            abort_if($pendingMandatory, 422, 'Masih ada step mandatory yang belum selesai.');

            $instance->update(['state' => 'done']);

            $updates = ['actual_end' => now()];
            if ($workOrder->status !== 'completed') {
                $this->setWorkOrderStatus($workOrder, 'completed', $actor, $notes ?? 'Process completed.');
            } else {
                $workOrder->update($updates);
            }

            $this->addEvent($workOrder, 'PROCESS_COMPLETED', $instance->current_step_order, null, $actor->id, ['notes' => $notes]);

            return $instance->fresh(['template.steps', 'stepLogs']);
        });
    }

    public function timeline(WorkOrder $workOrder): array
    {
        $statusLogs = $workOrder->statusLogs()
            ->with('changedBy:id,name')
            ->orderBy('changed_at')
            ->get()
            ->map(fn ($log) => [
                'type' => 'status',
                'time' => $log->changed_at,
                'title' => trim(($log->from_status ? $log->from_status.' -> ' : '').$log->to_status),
                'actor' => $log->changedBy?->name,
                'notes' => $log->notes,
            ]);

        $events = $workOrder->processEvents()
            ->orderBy('triggered_at')
            ->get()
            ->map(fn ($event) => [
                'type' => 'process_event',
                'time' => $event->triggered_at,
                'title' => $event->event_key,
                'actor_id' => $event->triggered_by,
                'payload' => $event->payload_json,
            ]);

        return $statusLogs->concat($events)->sortBy('time')->values()->all();
    }

    public function metrics(WorkOrder $workOrder): array
    {
        $steps = $workOrder->processStepLogs;
        $totalEst = (int) $steps->sum('est_minutes');
        $totalActual = (int) $steps->sum('actual_minutes');
        $totalDowntime = (int) $steps->sum('downtime_minutes');
        $lateSteps = $steps->filter(fn ($row) => $row->est_minutes && $row->actual_minutes && $row->actual_minutes > $row->est_minutes)->count();
        $totalSlaGap = $totalActual - $totalEst;

        return [
            'total_est_minutes' => $totalEst,
            'total_actual_minutes' => $totalActual,
            'total_sla_gap_minutes' => $totalSlaGap,
            'total_downtime_minutes' => $totalDowntime,
            'late_steps' => $lateSteps,
            'variance_minutes' => $totalSlaGap,
        ];
    }

    private function activeInstance(WorkOrder $workOrder): WoProcessInstance
    {
        $instance = $workOrder->processInstances()->whereIn('state', ['running', 'hold'])->latest()->first();
        abort_if(! $instance, 422, 'Process instance aktif tidak ditemukan.');

        return $instance;
    }

    private function activateNextReadyStep(WoProcessInstance $instance, WoProcessStepLog $currentStep, User $actor): ?WoProcessStepLog
    {
        $next = $instance->stepLogs()
            ->where('step_order', '>', $currentStep->step_order)
            ->where('status', 'ready')
            ->orderBy('step_order')
            ->first();

        if (! $next) {
            return null;
        }

        $instance->update(['current_step_order' => $next->step_order]);
        $this->addEvent($currentStep->workOrder, 'NEXT_STEP_READY', $currentStep->step_order, $next->step_order, $actor->id, [
            'step_code' => $next->step_code,
        ]);

        return $next;
    }

    private function resolveBayByStepCode(string $stepCode): ?string
    {
        return match ($stepCode) {
            // New 11-step flow codes
            'REGISTRATION' => null, // no bay
            'APPROVAL' => null, // no bay
            'WASHING_BAY', 'BAY_WASHING' => 'washing_bay',
            'INSPECTION_PKB', 'INSPECTION' => 'service_bay',
            'CHECKING', 'UNIT_CHECK_PART_NEED' => 'service_bay',
            'WAITING_BAY', 'BAY_WAITING' => 'waiting_bay',
            'CREATE_WO', 'KRANI_WO_JOBCARD' => 'waiting_bay',
            'REPAIR', 'SERVICE_REPAIR', 'EXECUTION', 'PLAN_REPAIR', 'RECEIVE_JOB', 'ACTION', 'PART_SUPPLY' => 'service_bay',
            'QC', 'QC_CHECK', 'VALIDATION' => 'qc_bay',
            'READY_BAY_CLOSE', 'CLOSE', 'CLOSE_WO' => 'ready_bay',
            'HANDOVER' => 'ready_bay',
            // Legacy codes
            'PLANNER_CHECK', 'ASST_VERIFY_JOBCARD', 'KOORD_ALLOCATE_MECHANIC' => 'waiting_bay',
            default => null,
        };
    }

    private function validateStationFeedback(string $stepCode, ?string $notes, array $stationData): void
    {
        $needsFeedback = in_array($stepCode, [
            'APPROVAL',
            'WASHING_BAY',
            'INSPECTION_PKB',
            'CHECKING',
            'WAITING_BAY',
            'CREATE_WO',
            'REPAIR',
            'QC',
            'READY_BAY_CLOSE',
            'HANDOVER',
        ], true);

        if (! $needsFeedback) {
            return;
        }

        $hasNotes = filled($notes);
        $hasStationData = ! empty($stationData);
        abort_if(! $hasNotes && ! $hasStationData, 422, 'Feedback/catatan station wajib diisi sebelum menyelesaikan tahap ini.');

        if (empty($stationData)) {
            return;
        }

        $value = static fn (string $key): string => trim((string) ($stationData[$key] ?? ''));
        $require = static function (string $key, string $message) use ($value): void {
            abort_if($value($key) === '', 422, $message);
        };
        $ensureIn = static function (string $key, array $allowed, string $message) use ($value): void {
            $current = $value($key);
            if ($current === '') {
                return;
            }
            abort_if(! in_array($current, $allowed, true), 422, $message);
        };

        switch ($stepCode) {
            case 'WASHING_BAY':
                $require('pre_wash_condition', 'Kondisi sebelum cuci wajib dipilih.');
                $require('post_wash_condition', 'Kondisi sesudah cuci wajib dipilih.');
                $require('post_wash_route', 'Rute setelah washing bay wajib dipilih.');
                $ensureIn('pre_wash_condition', ['RINGAN', 'SEDANG', 'BERAT'], 'Kondisi sebelum cuci tidak valid.');
                $ensureIn('post_wash_condition', ['OK', 'REWASH'], 'Kondisi sesudah cuci tidak valid.');
                $ensureIn('post_wash_route', [self::POST_WASH_ROUTE_CONTINUE_REPAIR, self::POST_WASH_ROUTE_COMPLETE_AFTER_WASH], 'Rute setelah washing bay tidak valid.');
                if ($value('post_wash_condition') === 'REWASH') {
                    $require('visual_note', 'Catatan visual wajib diisi bila hasil cuci perlu diulang.');
                }
                break;

            case 'INSPECTION_PKB':
                $require('inspection_result', 'Hasil inspeksi wajib dipilih.');
                $require('work_plan', 'Rencana pekerjaan wajib dipilih.');
                $ensureIn('inspection_result', ['NORMAL', 'ABNORMAL', 'FOLLOW_UP'], 'Hasil inspeksi tidak valid.');
                $ensureIn('work_plan', ['LANJUT_CHECKING', 'LANJUT_REPAIR', 'MENUNGGU_APPROVAL'], 'Rencana pekerjaan tidak valid.');
                break;

            case 'CHECKING':
                $require('checkpoint_result', 'Hasil checkpoint wajib dipilih.');
                $require('proceed_status', 'Status lanjut wajib dipilih.');
                $ensureIn('checkpoint_result', ['OK', 'NG'], 'Hasil checkpoint tidak valid.');
                $ensureIn('proceed_status', ['LANJUT_REPAIR', 'MENUNGGU_PART', 'TIDAK_LANJUT'], 'Status lanjut tidak valid.');
                if ($value('checkpoint_result') === 'NG') {
                    $require('checking_summary', 'Ringkasan temuan wajib diisi bila hasil checking NG.');
                }
                break;

            case 'WAITING_BAY':
                $require('waiting_reason', 'Alasan menunggu wajib diisi.');
                $require('waiting_type', 'Jenis waiting wajib dipilih.');
                $ensureIn('waiting_type', ['PART', 'SLOT_BAY', 'APPROVAL', 'TOOL', 'EXTERNAL'], 'Jenis waiting tidak valid.');
                break;

            case 'CREATE_WO':
                $require('sap_reference_no', 'SAP Reference No / WO No wajib diisi.');
                $require('jobcard_confirmation', 'Konfirmasi jobcard wajib dipilih.');
                $ensureIn('jobcard_confirmation', ['SUDAH_CETAK', 'BELUM_CETAK'], 'Konfirmasi jobcard tidak valid.');
                break;

            case 'REPAIR':
                $require('repair_action', 'Aksi perbaikan wajib diisi.');
                $ensureIn('technical_action', ['ADJUSTMENT', 'REPAIR', 'REPLACE', 'CLEANING'], 'Tindakan teknis tidak valid.');
                $ensureIn('obstacle', ['TIDAK_ADA', 'PART', 'TOOL', 'APPROVAL', 'WAKTU', 'LAINNYA'], 'Kendala perbaikan tidak valid.');
                if (in_array($value('obstacle'), ['PART', 'TOOL', 'APPROVAL', 'WAKTU', 'LAINNYA'], true)) {
                    $require('hold_reason', 'Detail kendala wajib diisi bila repair mengalami obstacle.');
                }
                break;

            case 'QC':
                $require('qc_result', 'Hasil QC wajib dipilih.');
                $require('qc_parameter', 'Parameter QC wajib diisi.');
                $ensureIn('qc_result', ['OK', 'NG'], 'Hasil QC tidak valid.');
                if ($value('qc_result') === 'NG') {
                    $require('rework_note', 'Catatan rework wajib diisi bila hasil QC NG.');
                }
                break;

            case 'READY_BAY_CLOSE':
                $require('closing_status', 'Status closing wajib dipilih.');
                $require('document_completeness', 'Kelengkapan dokumen wajib dipilih.');
                $ensureIn('closing_status', ['READY_CLOSE', 'PENDING_CLOSE'], 'Status closing tidak valid.');
                $ensureIn('document_completeness', ['LENGKAP', 'BELUM_LENGKAP'], 'Kelengkapan dokumen tidak valid.');
                break;

            case 'HANDOVER':
                $require('handover_confirmation', 'Konfirmasi serah terima wajib dipilih.');
                $ensureIn('handover_confirmation', ['DISETERIMAKAN', 'DITUNDA'], 'Konfirmasi serah terima tidak valid.');
                if ($value('handover_confirmation') === 'DISETERIMAKAN') {
                    $require('receiver', 'Nama penerima wajib diisi saat unit diserahterimakan.');
                }
                break;
        }
    }

    private function reservePartsForWorkOrder(WorkOrder $workOrder, User $actor, array $partItems): void
    {
        if (empty($partItems)) {
            $this->reportAbnormality($workOrder, [
                'category' => 'part_supply',
                'severity' => 'high',
                'summary' => 'PART_SUPPLY selesai tanpa data part_items.',
                'details_json' => [],
                'reported_by' => $actor->id,
            ]);
            abort(422, 'PART_SUPPLY membutuhkan part_items untuk reservasi part.');
        }

        foreach ($partItems as $item) {
            $partId = (int) ($item['part_id'] ?? 0);
            $qty = (float) ($item['qty'] ?? 1);
            $location = $this->normalizeInventoryLocation((string) ($item['location'] ?? 'gudang-utama'));

            if ($partId <= 0 || $qty <= 0) {
                $this->reportAbnormality($workOrder, [
                    'category' => 'part_supply',
                    'severity' => 'high',
                    'summary' => 'Data part_items tidak valid.',
                    'details_json' => ['item' => $item],
                    'reported_by' => $actor->id,
                ]);
                abort(422, 'Data part_items tidak valid.');
            }

            $sparePart = SparePart::query()->find($partId);

            $inventory = Inventory::query()
                ->where('part_id', $partId)
                ->where('location', $location)
                ->lockForUpdate()
                ->first();

            if (! $inventory || (float) $inventory->qty_available < $qty) {
                $this->reportAbnormality($workOrder, [
                    'category' => 'part_supply',
                    'severity' => 'critical',
                    'summary' => 'Stok tidak mencukupi untuk reservasi part.',
                    'details_json' => [
                        'part_id' => $partId,
                        'location' => $location,
                        'requested_qty' => $qty,
                        'available_qty' => $inventory ? (float) $inventory->qty_available : 0,
                    ],
                    'reported_by' => $actor->id,
                ]);
                abort(422, 'Stok part tidak cukup untuk reservasi.');
            }

            $inventory->decrement('qty_available', $qty);

            $usage = WoPartsUsage::query()->firstOrCreate(
                ['wo_id' => $workOrder->id, 'part_id' => $partId],
                ['qty_requested' => 0, 'qty_used' => 0, 'unit_price' => 0]
            );
            $usage->increment('qty_requested', $qty);
            $usage->increment('qty_used', $qty);

            InventoryTransaction::query()->create([
                'part_id' => $partId,
                'type' => 'out',
                'qty' => $qty,
                'unit_price' => (float) ($sparePart?->unit_price ?? 0),
                'reference_type' => 'work_order',
                'reference_id' => $workOrder->id,
                'processed_by' => $actor->id,
                'notes' => 'Reservasi part dari PART_SUPPLY',
            ]);
        }
    }

    private function shouldReservePartsForStep(WoProcessInstance $instance, string $stepCode, array $partItems): bool
    {
        if ($stepCode === 'PART_SUPPLY') {
            return true;
        }

        if ($stepCode !== 'REPAIR' || empty($partItems)) {
            return false;
        }

        $templateCode = strtoupper((string) optional($instance->template)->code);

        return str_starts_with($templateCode, 'WO-WORKSHOP-BAY-');
    }

    private function completeRemainingWorkshopStepsAfterWashing(
        WorkOrder $workOrder,
        WoProcessInstance $instance,
        WoProcessStepLog $washingStep,
        User $actor,
        $completedAt
    ): void {
        $remainingSteps = $instance->stepLogs()
            ->where('step_order', '>', $washingStep->step_order)
            ->orderBy('step_order')
            ->get();

        abort_if($remainingSteps->isEmpty(), 422, 'Tidak ada step lanjutan setelah washing bay untuk diselesaikan otomatis.');

        $handoverStep = $remainingSteps->first(fn (WoProcessStepLog $row) => strtoupper((string) $row->step_code) === 'HANDOVER');
        abort_if(! $handoverStep, 422, 'Step HANDOVER tidak ditemukan pada process instance aktif.');

        foreach ($remainingSteps as $step) {
            if (in_array($step->status, ['done', 'skipped'], true)) {
                continue;
            }

            abort_if(
                ! in_array($step->status, ['ready', 'hold', 'waiting_approval', 'in_progress', 'rejected'], true),
                422,
                'Ada step lanjutan dengan status yang tidak aman untuk auto-complete setelah washing bay.'
            );

            $step->update([
                'status' => 'done',
                'process_in_at' => $step->process_in_at ?? $completedAt,
                'process_out_at' => $completedAt,
                'actual_minutes' => $step->actual_minutes ?? 1,
                'downtime_minutes' => $step->downtime_minutes ?? 0,
                'performed_by' => $step->performed_by ?? $actor->id,
                'approved_by' => $step->approved_by ?? $actor->id,
                'reject_reason' => null,
                'notes' => $this->appendSystemNote($step->notes, self::AUTO_COMPLETE_AFTER_WASH_NOTE),
                'bay_in' => $step->bay_in ?: $this->resolveBayByStepCode($step->step_code),
                'bay_in_at' => $step->bay_in_at ?? $completedAt,
                'bay_out_at' => $completedAt,
                'queue_minutes' => 0,
            ]);

            $this->addEvent($workOrder, 'STEP_AUTO_COMPLETED_AFTER_WASHING', $washingStep->step_order, $step->step_order, $actor->id, [
                'step_code' => $step->step_code,
                'completed_at' => $completedAt->toISOString(),
            ]);
        }

        $instance->update([
            'current_step_order' => $handoverStep->step_order,
            'state' => 'running',
        ]);

        $this->addEvent($workOrder, 'ROUTE_COMPLETE_AFTER_WASHING', $washingStep->step_order, $handoverStep->step_order, $actor->id, [
            'step_code' => $washingStep->step_code,
            'route' => self::POST_WASH_ROUTE_COMPLETE_AFTER_WASH,
        ]);

        $this->completeProcess(
            $workOrder,
            $actor,
            'Process completed via washing bay route.'
        );
    }

    private function appendSystemNote(?string $notes, string $systemNote): string
    {
        $base = trim((string) $notes);
        if ($base === '') {
            return $systemNote;
        }

        if (str_contains($base, $systemNote)) {
            return $base;
        }

        return $base.' '.$systemNote;
    }

    private function normalizeInventoryLocation(string $location): string
    {
        return match (strtolower(trim($location))) {
            '', 'main' => 'gudang-utama',
            default => trim($location),
        };
    }

    private function reportAbnormality(WorkOrder $workOrder, array $payload): void
    {
        WoProcessAbnormality::query()->create([
            'wo_id' => $workOrder->id,
            'process_instance_id' => $payload['process_instance_id'] ?? null,
            'step_log_id' => $payload['step_log_id'] ?? null,
            'category' => $payload['category'] ?? 'general',
            'severity' => $payload['severity'] ?? 'medium',
            'status' => 'open',
            'summary' => $payload['summary'] ?? 'Abnormality detected.',
            'details_json' => $payload['details_json'] ?? null,
            'reported_by' => $payload['reported_by'] ?? null,
        ]);
    }

    private function addEvent(WorkOrder $workOrder, string $eventKey, ?int $sourceStep, ?int $targetStep, ?int $actorId, array $payload): void
    {
        WoProcessEvent::create([
            'wo_id' => $workOrder->id,
            'event_key' => $eventKey,
            'source_step_order' => $sourceStep,
            'target_step_order' => $targetStep,
            'triggered_by' => $actorId,
            'payload_json' => $payload,
            'triggered_at' => now(),
        ]);

        $actor = $actorId ? User::query()->find($actorId) : null;
        $meta = [
            'source_step_order' => $sourceStep,
            'target_step_order' => $targetStep,
            ...$payload,
        ];
        app(NotificationDispatcherService::class)->dispatchWorkOrderEvent($workOrder, $eventKey, $actor, $meta);
    }

    private function setWorkOrderStatus(WorkOrder $workOrder, string $newStatus, User $actor, ?string $notes = null): void
    {
        $oldStatus = $workOrder->status;
        if ($oldStatus === $newStatus) {
            return;
        }

        $updates = ['status' => $newStatus];
        if ($newStatus === 'in_progress' && ! $workOrder->actual_start) {
            $updates['actual_start'] = now();
        }
        if ($newStatus === 'completed') {
            $updates['actual_end'] = now();
        }

        $workOrder->update($updates);

        WorkOrderStatusLog::create([
            'wo_id' => $workOrder->id,
            'from_status' => $oldStatus,
            'to_status' => $newStatus,
            'changed_by' => $actor->id,
            'notes' => $notes,
            'changed_at' => now(),
        ]);
    }

    private function shouldBypassApprovalForWorkshopBay(WoProcessInstance $instance, string $stepCode): bool
    {
        $templateCode = strtoupper((string) optional($instance->template)->code);
        if (! str_starts_with($templateCode, 'WO-WORKSHOP-BAY-')) {
            return false;
        }

        return in_array($stepCode, ['APPROVAL', 'QC'], true);
    }

    private function syncPreWorkshopSteps(WorkOrder $workOrder, WoProcessInstance $instance, User $actor): void
    {
        $registrationStep = $instance->stepLogs()->where('step_code', 'REGISTRATION')->first();
        if ($registrationStep && ! in_array($registrationStep->status, ['done', 'skipped'], true)) {
            $registrationAt = $workOrder->created_at ?? now();
            $registrationStep->update([
                'status' => 'done',
                'process_in_at' => $registrationStep->process_in_at ?? $registrationAt,
                'process_out_at' => $registrationStep->process_out_at ?? $registrationAt,
                'actual_minutes' => $registrationStep->actual_minutes ?? 1,
                'performed_by' => $registrationStep->performed_by ?? $workOrder->created_by,
                'notes' => $registrationStep->notes ?? 'Auto-complete dari registrasi kedatangan.',
            ]);

            $this->addEvent($workOrder, 'REGISTRATION_SYNCED', $registrationStep->step_order, $registrationStep->step_order, $actor->id, []);
        }

        $approvalEligibleStatuses = ['triage', 'approved', 'pending', 'in_progress', 'on_hold', 'completed'];
        $approvalStep = $instance->stepLogs()->where('step_code', 'APPROVAL')->first();
        if (
            $approvalStep
            && in_array((string) $workOrder->status, $approvalEligibleStatuses, true)
            && ! in_array($approvalStep->status, ['done', 'skipped'], true)
        ) {
            $approvalLog = WorkOrderStatusLog::query()
                ->where('wo_id', $workOrder->id)
                ->whereIn('to_status', ['triage', 'approved'])
                ->orderBy('changed_at')
                ->first();

            $approvalAt = $approvalLog?->changed_at ?? now();
            $approvalBy = $approvalLog?->changed_by ?? $actor->id;

            $approvalStep->update([
                'status' => 'done',
                'process_in_at' => $approvalStep->process_in_at ?? $approvalAt,
                'process_out_at' => $approvalStep->process_out_at ?? $approvalAt,
                'actual_minutes' => $approvalStep->actual_minutes ?? 1,
                'performed_by' => $approvalStep->performed_by ?? $approvalBy,
                'approved_by' => $approvalStep->approved_by ?? $approvalBy,
                'notes' => $approvalStep->notes ?? 'Auto-complete dari triage/approval kedatangan.',
            ]);

            $this->addEvent($workOrder, 'ARRIVAL_APPROVAL_SYNCED', $approvalStep->step_order, $approvalStep->step_order, $approvalBy, []);
        }

        $nextReady = $instance->stepLogs()
            ->where('status', 'ready')
            ->orderBy('step_order')
            ->first();
        if ($nextReady && (int) $instance->current_step_order !== (int) $nextReady->step_order) {
            $instance->update(['current_step_order' => $nextReady->step_order]);
        }
    }
}
