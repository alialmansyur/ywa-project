<?php

namespace App\Services\Dashboard;

use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardService
{
    private function resolvePeriod(Request $request): array
    {
        $period = (string) $request->input('period', 'this_month');
        $fromInput = $request->input('from');
        $toInput = $request->input('to');

        if ($period === 'custom' && $fromInput && $toInput) {
            return [
                Carbon::parse($fromInput)->startOfDay(),
                Carbon::parse($toInput)->endOfDay(),
            ];
        }

        return match ($period) {
            'last_30_days' => [now()->subDays(29)->startOfDay(), now()->endOfDay()],
            'last_90_days' => [now()->subDays(89)->startOfDay(), now()->endOfDay()],
            default => [now()->startOfMonth(), now()->endOfDay()],
        };
    }

    public function overview(): array
    {
        $totalAssets = (int) DB::table('assets')->whereNull('deleted_at')->count();
        $activeWorkOrders = (int) DB::table('work_orders')->whereNull('deleted_at')->whereIn('status', ['draft', 'pending', 'approved', 'in_progress', 'on_hold'])->count();
        $overdueWorkOrders = (int) DB::table('work_orders')
            ->whereNull('deleted_at')
            ->whereIn('status', ['draft', 'pending', 'approved', 'in_progress', 'on_hold'])
            ->whereNotNull('scheduled_end')
            ->where('scheduled_end', '<', now())
            ->count();

        $today = now()->toDateString();
        $todayP2hTotal = (int) DB::table('p2h_submissions')->whereDate('submitted_at', $today)->count();
        $todayP2hApproved = (int) DB::table('p2h_submissions')->whereDate('submitted_at', $today)->where('status', 'approved')->count();
        $p2hCompliancePct = $todayP2hTotal > 0 ? round(($todayP2hApproved / $todayP2hTotal) * 100, 1) : 0.0;

        $mttr = DB::table('wo_process_step_logs')
            ->whereNotNull('actual_minutes')
            ->whereDate('updated_at', '>=', now()->startOfMonth()->toDateString())
            ->avg('actual_minutes');

        return [
            'total_assets' => $totalAssets,
            'active_work_orders' => $activeWorkOrders,
            'overdue_work_orders' => $overdueWorkOrders,
            'p2h_today' => [
                'total' => $todayP2hTotal,
                'approved' => $todayP2hApproved,
                'compliance_pct' => (float) $p2hCompliancePct,
            ],
            'mttr_minutes_month' => $mttr ? round((float) $mttr, 2) : 0.0,
        ];
    }

    public function workshopOperationalSummary(): array
    {
        $today = now()->toDateString();

        $woTodayTotal = (int) DB::table('work_orders')
            ->whereNull('deleted_at')
            ->whereDate('created_at', $today)
            ->count();

        $woActiveTotal = (int) DB::table('work_orders')
            ->whereNull('deleted_at')
            ->whereIn('status', ['registered', 'triage', 'draft', 'pending', 'approved', 'in_progress', 'on_hold'])
            ->count();

        $woHoldTotal = (int) DB::table('work_orders')
            ->whereNull('deleted_at')
            ->where('status', 'on_hold')
            ->count();

        $woCompletedToday = (int) DB::table('work_orders')
            ->whereNull('deleted_at')
            ->where('status', 'completed')
            ->whereDate(DB::raw('COALESCE(actual_end, updated_at)'), $today)
            ->count();

        $startToday = now()->copy()->startOfDay();

        $scheduleDueTodayTotal = (int) DB::table('maintenance_schedules')
            ->where('status', '!=', 'completed')
            ->whereDate('next_due_at', $today)
            ->count();

        $scheduleOverdueTotal = (int) DB::table('maintenance_schedules')
            ->where('status', '!=', 'completed')
            ->whereNotNull('next_due_at')
            ->where('next_due_at', '<', $startToday)
            ->count();

        $scheduleUpcoming7dTotal = (int) DB::table('maintenance_schedules')
            ->where('status', '!=', 'completed')
            ->whereNotNull('next_due_at')
            ->whereBetween('next_due_at', [now(), now()->copy()->addDays(7)->endOfDay()])
            ->count();

        $lateStepsTotal = (int) DB::table('wo_process_step_logs')
            ->whereDate('updated_at', $today)
            ->whereNotNull('est_minutes')
            ->whereNotNull('actual_minutes')
            ->whereColumn('actual_minutes', '>', 'est_minutes')
            ->count();

        $downtimeTodayMinutes = (int) DB::table('wo_process_step_logs')
            ->whereDate('updated_at', $today)
            ->sum('downtime_minutes');

        return [
            'wo_today_total' => $woTodayTotal,
            'wo_active_total' => $woActiveTotal,
            'wo_hold_total' => $woHoldTotal,
            'wo_completed_today' => $woCompletedToday,
            'schedule_due_today_total' => $scheduleDueTodayTotal,
            'schedule_overdue_total' => $scheduleOverdueTotal,
            'schedule_upcoming_7d_total' => $scheduleUpcoming7dTotal,
            'late_steps_total' => $lateStepsTotal,
            'downtime_today_minutes' => $downtimeTodayMinutes,
            'generated_at' => now()->toISOString(),
            'timezone' => now()->getTimezone()->getName(),
        ];
    }

    public function analystSummary(Request $request): array
    {
        $range = (int) $request->integer('range', 30);
        if (!in_array($range, [7, 30, 90], true)) {
            $range = 30;
        }

        $from = now()->subDays($range - 1)->startOfDay();
        $to = now()->endOfDay();

        $createdRows = DB::table('work_orders')
            ->selectRaw('DATE(created_at) as date_key')
            ->selectRaw('COUNT(*) as total')
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('date_key')
            ->pluck('total', 'date_key');

        $completedRows = DB::table('work_orders')
            ->selectRaw('DATE(COALESCE(actual_end, updated_at)) as date_key')
            ->selectRaw('COUNT(*) as total')
            ->whereNull('deleted_at')
            ->where('status', 'completed')
            ->whereBetween(DB::raw('COALESCE(actual_end, updated_at)'), [$from, $to])
            ->groupBy('date_key')
            ->pluck('total', 'date_key');

        $downtimeRows = DB::table('wo_process_step_logs')
            ->selectRaw('DATE(updated_at) as date_key')
            ->selectRaw('SUM(COALESCE(downtime_minutes, 0)) as total')
            ->whereBetween('updated_at', [$from, $to])
            ->groupBy('date_key')
            ->pluck('total', 'date_key');

        $queueRows = DB::table('wo_process_step_logs')
            ->selectRaw('DATE(updated_at) as date_key')
            ->selectRaw('AVG(COALESCE(queue_minutes, 0)) as avg_queue')
            ->whereBetween('updated_at', [$from, $to])
            ->groupBy('date_key')
            ->pluck('avg_queue', 'date_key');

        $trend = [];
        for ($i = 0; $i < $range; $i++) {
            $day = $from->copy()->addDays($i);
            $key = $day->toDateString();
            $trend[] = [
                'date' => $key,
                'label' => $day->format('d M'),
                'wo_created' => (int) ($createdRows[$key] ?? 0),
                'wo_completed' => (int) ($completedRows[$key] ?? 0),
                'downtime_minutes' => (int) ($downtimeRows[$key] ?? 0),
                'avg_queue_minutes' => round((float) ($queueRows[$key] ?? 0), 2),
            ];
        }

        $statusMix = DB::table('work_orders')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('status')
            ->orderBy('status')
            ->get()
            ->map(fn ($row) => [
                'status' => (string) $row->status,
                'total' => (int) $row->total,
            ])
            ->values();

        $bottleneckRows = DB::table('wo_process_step_logs')
            ->select('step_code', DB::raw('SUM(COALESCE(downtime_minutes, 0)) as total_downtime_minutes'))
            ->whereBetween('updated_at', [$from, $to])
            ->groupBy('step_code')
            ->orderByDesc('total_downtime_minutes')
            ->limit(5)
            ->get();

        $totalCreated = array_sum(array_map(fn ($row) => $row['wo_created'], $trend));
        $totalCompleted = array_sum(array_map(fn ($row) => $row['wo_completed'], $trend));
        $totalDowntime = array_sum(array_map(fn ($row) => $row['downtime_minutes'], $trend));

        return [
            'range_days' => $range,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'trend' => $trend,
            'status_mix' => $statusMix,
            'bottlenecks' => $bottleneckRows,
            'totals' => [
                'wo_created' => $totalCreated,
                'wo_completed' => $totalCompleted,
                'completion_rate' => $totalCreated > 0 ? round(($totalCompleted / $totalCreated) * 100, 1) : 0,
                'downtime_minutes' => $totalDowntime,
            ],
        ];
    }

    public function workOrderStatus(Request $request): array
    {
        [$from, $to] = $this->resolvePeriod($request);

        $rows = DB::table('work_orders')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'labels' => $rows->pluck('status')->values(),
            'series' => $rows->pluck('total')->map(fn ($n) => (int) $n)->values(),
            'items' => $rows->map(fn ($r) => ['status' => $r->status, 'total' => (int) $r->total])->values(),
        ];
    }

    public function workOrderPriority(Request $request): array
    {
        [$from, $to] = $this->resolvePeriod($request);

        $rows = DB::table('work_orders')
            ->select('priority', DB::raw('COUNT(*) as total'))
            ->whereNull('deleted_at')
            ->whereBetween('created_at', [$from, $to])
            ->groupBy('priority')
            ->orderBy('priority')
            ->get();

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'labels' => $rows->pluck('priority')->values(),
            'series' => $rows->pluck('total')->map(fn ($n) => (int) $n)->values(),
            'items' => $rows->map(fn ($r) => ['priority' => $r->priority, 'total' => (int) $r->total])->values(),
        ];
    }

    public function downtimeTrend(Request $request): array
    {
        [$from, $to] = $this->resolvePeriod($request);

        $rows = DB::table('wo_process_step_logs')
            ->selectRaw('DATE(updated_at) as date_key')
            ->selectRaw('SUM(COALESCE(downtime_minutes, 0)) as total_downtime_minutes')
            ->selectRaw('SUM(COALESCE(est_minutes, 0)) as total_sla_minutes')
            ->selectRaw('SUM(COALESCE(actual_minutes, 0)) as total_actual_minutes')
            ->whereBetween('updated_at', [$from, $to])
            ->groupBy('date_key')
            ->orderBy('date_key')
            ->get()
            ->keyBy('date_key');

        $labels = [];
        $series = [];
        $slaSeries = [];
        $actualSeries = [];
        $reportedDowntimeSeries = [];
        $days = max(1, $from->copy()->startOfDay()->diffInDays($to->copy()->startOfDay()) + 1);

        for ($i = 0; $i < $days; $i++) {
            $day = $from->copy()->addDays($i);
            $key = $day->toDateString();
            $totalSlaMinutes = (int) ($rows[$key]->total_sla_minutes ?? 0);
            $totalActualMinutes = (int) ($rows[$key]->total_actual_minutes ?? 0);
            $totalReportedDowntimeMinutes = (int) ($rows[$key]->total_downtime_minutes ?? 0);

            $labels[] = $day->format('d M');
            $series[] = $totalActualMinutes - $totalSlaMinutes;
            $slaSeries[] = $totalSlaMinutes;
            $actualSeries[] = $totalActualMinutes;
            $reportedDowntimeSeries[] = $totalReportedDowntimeMinutes;
        }

        return [
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
            'labels' => $labels,
            'series' => $series,
            'sla_series' => $slaSeries,
            'actual_series' => $actualSeries,
            'reported_downtime_series' => $reportedDowntimeSeries,
        ];
    }

    public function p2hComplianceTrend(Request $request): array
    {
        $range = (int) $request->integer('range', 30);
        if (!in_array($range, [7, 30, 90], true)) {
            $range = 30;
        }

        $start = now()->subDays($range - 1)->startOfDay();
        $end = now()->endOfDay();

        $rows = DB::table('p2h_submissions')
            ->selectRaw('DATE(submitted_at) as date_key')
            ->selectRaw('COUNT(*) as total')
            ->selectRaw("SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved")
            ->whereBetween('submitted_at', [$start, $end])
            ->groupBy('date_key')
            ->orderBy('date_key')
            ->get()
            ->keyBy('date_key');

        $labels = [];
        $series = [];

        for ($i = 0; $i < $range; $i++) {
            $day = $start->copy()->addDays($i);
            $key = $day->toDateString();
            $row = $rows->get($key);
            $total = $row ? (int) $row->total : 0;
            $approved = $row ? (int) $row->approved : 0;
            $pct = $total > 0 ? round(($approved / $total) * 100, 1) : 0.0;

            $labels[] = $day->format('d M');
            $series[] = $pct;
        }

        return [
            'range_days' => $range,
            'from' => $start->toDateString(),
            'to' => $end->toDateString(),
            'labels' => $labels,
            'series' => $series,
        ];
    }

    public function upcomingSchedules(Request $request): array
    {
        $days = max(1, min(30, (int) $request->integer('days', 7)));
        $limit = max(1, min(50, (int) $request->integer('limit', 10)));
        $toDate = now()->addDays($days)->endOfDay();

        $rows = DB::table('maintenance_schedules as ms')
            ->join('assets as a', 'a.id', '=', 'ms.asset_id')
            ->select([
                'ms.id',
                'ms.name',
                'ms.type',
                'ms.status',
                'ms.next_due_at',
                'ms.next_due_hm',
                'a.id as asset_id',
                'a.code as asset_code',
                'a.name as asset_name',
                'a.current_hm',
            ])
            ->where('ms.status', '!=', 'completed')
            ->whereNotNull('ms.next_due_at')
            ->where('ms.next_due_at', '<=', $toDate)
            ->orderBy('ms.next_due_at')
            ->limit($limit)
            ->get()
            ->map(function ($row) {
                $dueAt = $row->next_due_at ? Carbon::parse($row->next_due_at) : null;
                $daysLeft = $dueAt ? (int) floor(now()->diffInDays($dueAt, false)) : null;

                return [
                    'id' => (int) $row->id,
                    'name' => $row->name,
                    'type' => $row->type,
                    'status' => $row->status,
                    'next_due_at' => $row->next_due_at,
                    'next_due_hm' => $row->next_due_hm !== null ? (float) $row->next_due_hm : null,
                    'asset' => [
                        'id' => (int) $row->asset_id,
                        'code' => $row->asset_code,
                        'name' => $row->asset_name,
                        'current_hm' => $row->current_hm !== null ? (float) $row->current_hm : null,
                    ],
                    'days_left' => $daysLeft,
                ];
            })
            ->values();

        return [
            'upcoming_days' => $days,
            'days' => $days,
            'count' => $rows->count(),
            'data' => $rows,
            'schedules' => $rows,
        ];
    }

    public function assetStatus(): array
    {
        $rows = DB::table('assets')
            ->select('status', DB::raw('COUNT(*) as total'))
            ->whereNull('deleted_at')
            ->groupBy('status')
            ->orderBy('status')
            ->get();

        $total = (int) $rows->sum('total');

        return [
            'total' => $total,
            'items' => $rows->map(function ($row) use ($total) {
                $count = (int) $row->total;
                return [
                    'status' => $row->status,
                    'total' => $count,
                    'pct' => $total > 0 ? round(($count / $total) * 100, 1) : 0.0,
                ];
            })->values(),
        ];
    }

    public function recentActivities(Request $request): array
    {
        $limit = min(50, max(5, (int) $request->integer('limit', 20)));

        $rows = DB::table('wo_process_events as e')
            ->join('work_orders as wo', 'wo.id', '=', 'e.wo_id')
            ->leftJoin('users as u', 'u.id', '=', 'e.triggered_by')
            ->select([
                'e.id',
                'e.event_key',
                'e.triggered_at',
                'wo.id as wo_id',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'u.name as actor_name',
            ])
            ->orderByDesc('e.triggered_at')
            ->limit($limit)
            ->get()
            ->map(fn ($row) => [
                'id' => (int) $row->id,
                'event_key' => $row->event_key,
                'triggered_at' => $row->triggered_at,
                'wo' => [
                    'id' => (int) $row->wo_id,
                    'code' => $row->wo_code,
                    'sap_reference_no' => $row->sap_reference_no,
                ],
                'actor_name' => $row->actor_name,
            ])
            ->values();

        return [
            'count' => $rows->count(),
            'data' => $rows,
        ];
    }

}
