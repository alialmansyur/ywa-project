<?php

namespace App\Services\WorkOrder;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WorkshopControlTowerService
{
    private const WEB_BAY_STEP_CODES = [
        'registration' => ['REGISTRATION'],
        'approval' => ['APPROVAL'],
        'washing_bay' => ['WASHING_BAY', 'BAY_WASHING'],
        'inspection_pkb' => ['INSPECTION_PKB', 'INSPECTION'],
        'checking' => ['CHECKING', 'UNIT_CHECK_PART_NEED'],
        'waiting_bay' => ['WAITING_BAY', 'BAY_WAITING'],
        'create_wo' => ['CREATE_WO', 'KRANI_WO_JOBCARD'],
        'repair' => ['REPAIR', 'SERVICE_REPAIR', 'PART_SUPPLY', 'EXECUTION', 'ACTION'],
        'qc' => ['QC', 'QC_CHECK'],
        'ready_bay_close' => ['READY_BAY_CLOSE', 'CLOSE_WO', 'CLOSE'],
        'handover' => ['HANDOVER'],
    ];

    private const CURRENT_BAY_VALUES = [
        'washing_bay',
        'waiting_bay',
        'service_bay',
        'qc_bay',
        'ready_bay',
    ];

    public function overview(): array
    {
        $rows = $this->currentQueueBase()->get();

        $byBay = [
            'washing_bay' => 0,
            'waiting_bay' => 0,
            'service_bay' => 0,
            'qc_bay' => 0,
            'ready_bay' => 0,
        ];

        foreach ($rows as $row) {
            $bay = $row->current_bay ?: 'waiting_bay';
            if (isset($byBay[$bay])) {
                $byBay[$bay]++;
            }
        }

        $lateSteps = $rows->filter(fn ($r) => $r->est_minutes && $r->actual_minutes && $r->actual_minutes > $r->est_minutes)->count();

        $todayDowntime = (int) DB::table('wo_process_step_logs')
            ->whereDate('updated_at', now()->toDateString())
            ->sum('downtime_minutes');

        $todaySlaGap = (int) DB::table('wo_process_step_logs')
            ->whereDate('updated_at', now()->toDateString())
            ->selectRaw('SUM(COALESCE(actual_minutes, 0) - COALESCE(est_minutes, 0)) as total_gap_minutes')
            ->value('total_gap_minutes');

        return [
            'active_wo' => $rows->count(),
            'hold_wo' => $rows->where('wo_status', 'on_hold')->count(),
            'late_steps' => $lateSteps,
            'total_sla_gap_today' => $todaySlaGap,
            'total_downtime_today' => $todayDowntime,
            'bay_counts' => $byBay,
        ];
    }

    public function queues(Request $request): array
    {
        $rows = $this->applyFilters($this->currentQueueBase(), $request)->get();

        $board = [
            'washing_bay' => [],
            'waiting_bay' => [],
            'service_bay' => [],
            'qc_bay' => [],
            'ready_bay' => [],
        ];

        foreach ($rows as $row) {
            $bay = $row->current_bay ?: 'waiting_bay';
            if (! isset($board[$bay])) {
                $board[$bay] = [];
            }
            $board[$bay][] = $row;
        }

        return $board;
    }

    public function stepQueues(Request $request): array
    {
        $rows = $this->applyFilters($this->currentQueueBase(), $request)->get();

        $keys = [
            'PLANNER_CHECK',
            'KRANI_WO_JOBCARD',
            'ASST_VERIFY_JOBCARD',
            'KOORD_ALLOCATE_MECHANIC',
            'UNIT_CHECK_PART_NEED',
            'PART_SUPPLY',
            'SERVICE_REPAIR',
            'QC_CHECK',
            'CLOSE_WO',
        ];
        $out = [];
        foreach ($keys as $k) {
            $out[$k] = [];
        }

        foreach ($rows as $row) {
            $code = (string) $row->step_code;
            if (! isset($out[$code])) {
                continue;
            }
            $out[$code][] = $row;
        }

        return $out;
    }

    public function liveFeed(Request $request): array
    {
        $limit = min(100, max(10, (int) $request->integer('limit', 30)));

        return DB::table('wo_process_events as e')
            ->join('work_orders as wo', 'wo.id', '=', 'e.wo_id')
            ->leftJoin('users as u', 'u.id', '=', 'e.triggered_by')
            ->select([
                'e.id',
                'e.wo_id',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'e.event_key',
                'e.source_step_order',
                'e.target_step_order',
                'e.payload_json',
                'e.triggered_at',
                'u.name as actor_name',
            ])
            ->whereIn('e.event_key', [
                'STEP_IN', 'STEP_OUT', 'STEP_HOLD', 'STEP_RESUME', 'STEP_APPROVED', 'STEP_REJECTED',
                'BAY_IN', 'BAY_OUT', 'QC_OK', 'QC_NOT_OK', 'ROUTE_TO_SERVICE_REWORK',
            ])
            ->orderByDesc('e.triggered_at')
            ->limit($limit)
            ->get()
            ->all();
    }

    public function bottlenecks(Request $request): array
    {
        $from = $request->input('from') ?: now()->subDays(7)->toDateString();
        $to = $request->input('to') ?: now()->toDateString();
        $queueRows = $this->applyFilters($this->currentQueueBase(), $request)->get();

        $byActual = DB::table('wo_process_step_logs')
            ->select('step_code', DB::raw('AVG(actual_minutes) as avg_actual_minutes'), DB::raw('COUNT(*) as sample_count'))
            ->whereBetween(DB::raw('DATE(updated_at)'), [$from, $to])
            ->whereNotNull('actual_minutes')
            ->groupBy('step_code')
            ->orderByDesc('avg_actual_minutes')
            ->limit(5)
            ->get();

        $byDowntime = DB::table('wo_process_step_logs')
            ->select('step_code', DB::raw('SUM(downtime_minutes) as total_downtime_minutes'))
            ->whereBetween(DB::raw('DATE(updated_at)'), [$from, $to])
            ->groupBy('step_code')
            ->orderByDesc('total_downtime_minutes')
            ->limit(5)
            ->get();

        $bySlaGap = DB::table('wo_process_step_logs')
            ->select(
                'step_code',
                DB::raw('SUM(COALESCE(actual_minutes, 0) - COALESCE(est_minutes, 0)) as total_sla_gap_minutes')
            )
            ->whereBetween(DB::raw('DATE(updated_at)'), [$from, $to])
            ->groupBy('step_code')
            ->orderByDesc('total_sla_gap_minutes')
            ->limit(5)
            ->get();

        $byBay = DB::table('wo_process_step_logs')
            ->select('bay_in', DB::raw('AVG(queue_minutes) as avg_queue_minutes'), DB::raw('COUNT(*) as sample_count'))
            ->whereBetween(DB::raw('DATE(updated_at)'), [$from, $to])
            ->whereNotNull('bay_in')
            ->groupBy('bay_in')
            ->orderByDesc('avg_queue_minutes')
            ->limit(5)
            ->get();

        $summaryRow = $queueRows
            ->sortByDesc(fn ($row) => (int) ($row->queue_minutes_live ?? 0))
            ->first();

        $late = $queueRows
            ->filter(function ($row) {
                $est = (int) ($row->est_minutes ?? 0);
                if ($est <= 0) {
                    return false;
                }

                $actual = (int) ($row->actual_minutes ?? 0);
                $queueLive = (int) ($row->queue_minutes_live ?? 0);

                return $actual > $est || $queueLive > $est;
            })
            ->count();

        $hold = $queueRows
            ->filter(fn ($row) => strtolower((string) ($row->wo_status ?? '')) === 'on_hold')
            ->count();

        $step = $summaryRow?->step_code
            ?? $bySlaGap->first()?->step_code
            ?? $byDowntime->first()?->step_code
            ?? $byActual->first()?->step_code
            ?? null;

        return [
            'top_by_actual' => $byActual,
            'top_by_sla_gap' => $bySlaGap,
            'top_by_downtime' => $byDowntime,
            'top_bay_by_queue' => $byBay,
            'summary' => [
                'step' => $step,
                'late' => $late,
                'hold' => $hold,
            ],
            // Flat aliases for current dashboard consumer.
            'step' => $step,
            'late' => $late,
            'hold' => $hold,
        ];
    }

    public function workOrders(Request $request)
    {
        $query = $this->applyFilters($this->currentQueueBase(), $request)
            ->orderByDesc('wo_created_at');

        return $query->paginate($request->integer('per_page', 10));
    }

    public function approvalQueue(Request $request)
    {
        $q = DB::table('work_orders as wo')
            ->leftJoin('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('users as sup', 'sup.id', '=', 'wo.supervisor_id')
            ->select([
                'wo.id as wo_id',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'wo.type as wo_type',
                'wo.priority as wo_priority',
                'wo.status as wo_status',
                'wo.title as wo_title',
                'wo.created_at as wo_created_at',
                'a.code as asset_code',
                'a.name as asset_name',
                'a.veh_plate_no',
                'a.plate_number',
                'sup.name as supervisor_name',
            ])
            ->whereNull('wo.deleted_at')
            ->where('wo.status', 'registered')
            ->orderByDesc('wo.created_at');

        return $q->paginate($request->integer('per_page', 20));
    }

    private function currentQueueBase()
    {
        $latestInstanceSub = DB::table('wo_process_instances')
            ->selectRaw('MAX(id) as id')
            ->whereIn('state', ['running', 'hold', 'not_started'])
            ->groupBy('wo_id');

        return DB::table('wo_process_instances as wpi')
            ->joinSub($latestInstanceSub, 'latest', fn ($join) => $join->on('latest.id', '=', 'wpi.id'))
            ->join('work_orders as wo', 'wo.id', '=', 'wpi.wo_id')
            ->leftJoin('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('users as sup', 'sup.id', '=', 'wo.supervisor_id')
            ->leftJoin('wo_process_step_logs as s', function ($join) {
                $join->on('s.process_instance_id', '=', 'wpi.id')
                    ->on('s.step_order', '=', 'wpi.current_step_order');
            })
            ->select([
                'wo.id as wo_id',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'wo.type as wo_type',
                'wo.priority as wo_priority',
                'wo.status as wo_status',
                'wo.supervisor_id',
                'wo.created_at as wo_created_at',
                'a.code as asset_code',
                'a.io_code as asset_io_code',
                'a.name as asset_name',
                'a.asset_no as asset_no',
                'a.serial_number',
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number) as license_plate'),
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number) as police_no'),
                'sup.name as supervisor_name',
                'wpi.id as instance_id',
                'wpi.state as instance_state',
                'wpi.current_step_order',
                's.step_code',
                's.step_name',
                's.status as step_status',
                's.est_minutes',
                's.actual_minutes',
                's.downtime_minutes',
                's.rework_count',
                DB::raw("COALESCE(s.bay_in,
                    CASE
                        WHEN s.step_code = 'BAY_WASHING' THEN 'washing_bay'
                        WHEN s.step_code = 'BAY_WAITING' THEN 'waiting_bay'
                        WHEN s.step_code IN ('PLANNER_CHECK','KRANI_WO_JOBCARD','ASST_VERIFY_JOBCARD','KOORD_ALLOCATE_MECHANIC') THEN 'waiting_bay'
                        WHEN s.step_code IN ('UNIT_CHECK_PART_NEED','PART_SUPPLY','SERVICE_REPAIR','RECEIVE_JOB','INSPECTION','EXECUTION','PLAN_REPAIR','REPAIR','ACTION') THEN 'service_bay'
                        WHEN s.step_code IN ('QC_CHECK','QC','VALIDATION','APPROVAL') THEN 'qc_bay'
                        WHEN s.step_code IN ('CLOSE','CLOSE_WO') THEN 'ready_bay'
                        ELSE 'waiting_bay'
                    END
                ) as current_bay"),
                DB::raw('COALESCE(s.queue_minutes, TIMESTAMPDIFF(MINUTE, COALESCE(s.bay_in_at, s.created_at, wo.created_at), NOW())) as queue_minutes_live'),
            ])
            ->whereNull('wo.deleted_at')
            ->whereNotIn('wo.status', ['completed', 'cancelled']);
    }

    private function applyFilters($query, Request $request)
    {
        $stepCodeFilter = $this->resolveBayStepCodes($request->input('bay'));
        $currentBayFilter = $this->resolveCurrentBayFilterValues($request->input('bay'));

        return $query
            ->when(! empty($stepCodeFilter), function ($q) use ($stepCodeFilter) {
                if (count($stepCodeFilter) === 1) {
                    return $q->where('s.step_code', '=', $stepCodeFilter[0]);
                }

                return $q->whereIn('s.step_code', $stepCodeFilter);
            })
            ->when(! empty($currentBayFilter), function ($q) use ($currentBayFilter) {
                if (count($currentBayFilter) === 1) {
                    return $q->having('current_bay', '=', $currentBayFilter[0]);
                }

                return $q->havingRaw(
                    'current_bay IN (' . implode(', ', array_fill(0, count($currentBayFilter), '?')) . ')',
                    $currentBayFilter
                );
            })
            ->when($request->input('wo_type'), fn ($q, $type) => $q->where('wo.type', $type))
            ->when($request->input('status'), fn ($q, $status) => $q->where('wo.status', $status))
            ->when($request->input('supervisor_id'), fn ($q, $supervisorId) => $q->where('wo.supervisor_id', $supervisorId))
            ->when($request->input('q'), function ($q, $term) {
                $needle = trim((string) $term);
                $q->where(function ($sub) use ($needle) {
                    $sub->where('wo.code', 'like', "%{$needle}%")
                        ->orWhere('wo.sap_reference_no', 'like', "%{$needle}%")
                        ->orWhere('wo.title', 'like', "%{$needle}%")
                        ->orWhere('wo.description', 'like', "%{$needle}%")
                        ->orWhere('a.code', 'like', "%{$needle}%")
                        ->orWhere('a.io_code', 'like', "%{$needle}%")
                        ->orWhere('a.name', 'like', "%{$needle}%")
                        ->orWhere('a.asset_no', 'like', "%{$needle}%")
                        ->orWhere('a.serial_number', 'like', "%{$needle}%")
                        ->orWhere('a.veh_plate_no', 'like', "%{$needle}%")
                        ->orWhere('a.plate_number', 'like', "%{$needle}%")
                        ->orWhere('sup.name', 'like', "%{$needle}%")
                        ->orWhere('s.step_name', 'like', "%{$needle}%");
                });
            });
    }

    private function resolveBayStepCodes(mixed $bay): array
    {
        $value = strtolower(trim((string) $bay));
        if ($value === '') {
            return [];
        }

        return self::WEB_BAY_STEP_CODES[$value] ?? [];
    }

    private function resolveCurrentBayFilterValues(mixed $bay): array
    {
        $value = strtolower(trim((string) $bay));
        if ($value === '') {
            return [];
        }

        return in_array($value, self::CURRENT_BAY_VALUES, true) ? [$value] : [];
    }
}
