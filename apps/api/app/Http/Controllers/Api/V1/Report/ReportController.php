<?php

namespace App\Http\Controllers\Api\V1\Report;

use App\Http\Controllers\Controller;
use Carbon\Carbon;
use Carbon\CarbonPeriod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    private function getDateRange(Request $request): array
    {
        return [
            $request->query('start', now()->startOfMonth()->toDateString()),
            $request->query('end', now()->endOfMonth()->toDateString()),
        ];
    }

    private function dateRangeTimestamp(string $start, string $end): array
    {
        return [$start . ' 00:00:00', $end . ' 23:59:59'];
    }

    public function data(Request $request)
    {
        $type = (string) $request->query('type', 'p2h');

        return match ($type) {
            'p2h' => $this->p2hReport($request),
            'wo' => $this->woReport($request),
            'breakdown' => $this->breakdownReport($request),
            'cost' => $this->costReport($request),
            'utilization' => $this->utilizationReport($request),
            'mechanic' => $this->mechanicReport($request),
            'wo-history' => $this->woHistoryReport($request),
            'workshop-step-control' => $this->workshopStepControlReport($request),
            'service-history' => $this->serviceHistoryReport($request),
            'downtime-analysis' => $this->downtimeAnalysisReport($request),
            default => response()->json(['error' => 'Unknown report type'], 400),
        };
    }

    private function p2hReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        $totalDays = Carbon::parse($start)->diffInDays(Carbon::parse($end)) + 1;
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $p2hStats = DB::table('p2h_submissions as p')
            ->join('assets as a', 'p.asset_id', '=', 'a.id')
            ->leftJoin('p2h_items as i', 'i.submission_id', '=', 'p.id')
            ->whereBetween('p.created_at', [$fromTs, $toTs])
            ->select(
                'a.code',
                'a.name',
                DB::raw('COUNT(DISTINCT p.id) as done'),
                DB::raw('SUM(CASE WHEN i.condition = "not_ok" THEN 1 ELSE 0 END) as findings')
            )
            ->groupBy('a.id', 'a.code', 'a.name')
            ->get()
            ->map(function ($item) use ($totalDays) {
                $item->total_days = $totalDays;
                $item->missed = max(0, $totalDays - $item->done);
                $item->rate = ($totalDays > 0) ? round(($item->done / $totalDays) * 100) : 0;
                $item->color = $item->rate >= 90 ? 'green' : ($item->rate >= 75 ? 'yellow' : 'red');
                return $item;
            });

        $daily = DB::table('p2h_submissions')
            ->whereBetween('created_at', [$fromTs, $toTs])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(DISTINCT asset_id) as done_count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy(DB::raw('DATE(created_at)'))
            ->get()
            ->keyBy('date');

        $totalAssets = DB::table('assets')->count() ?: 1;
        $chartData = [];
        $period = CarbonPeriod::create($start, $end);
        foreach ($period as $date) {
            $d = $date->toDateString();
            $done = $daily[$d]->done_count ?? 0;
            $rate = round(($done / $totalAssets) * 100);
            $chartData[] = ['date' => $date->format('j M'), 'rate' => $rate];
        }

        return response()->json([
            'summary' => [
                'total_submission' => $p2hStats->sum('done'),
                'avg_compliance' => $p2hStats->avg('rate') ? round($p2hStats->avg('rate')) : 0,
                'total_findings' => $p2hStats->sum('findings'),
                'assets_monitored' => $p2hStats->count(),
            ],
            'chart' => $chartData,
            'details' => $p2hStats->values(),
        ]);
    }

    private function woReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $woStats = DB::table('work_orders as w')
            ->join('assets as a', 'w.asset_id', '=', 'a.id')
            ->whereBetween('w.created_at', [$fromTs, $toTs])
            ->when($request->filled('status'), fn ($q) => $q->where('w.status', $request->string('status')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('w.type', $request->string('wo_type')))
            ->select(
                'a.code',
                'a.name',
                DB::raw('COUNT(w.id) as total_wo'),
                DB::raw('SUM(CASE WHEN w.status = "completed" THEN 1 ELSE 0 END) as completed_wo'),
                DB::raw('SUM(w.actual_cost) as total_cost')
            )
            ->groupBy('a.id', 'a.code', 'a.name')
            ->get();

        $byStatus = DB::table('work_orders')
            ->whereBetween('created_at', [$fromTs, $toTs])
            ->select('status', DB::raw('COUNT(id) as count'))
            ->groupBy('status')
            ->get();

        return response()->json([
            'summary' => [
                'total_wo' => $woStats->sum('total_wo'),
                'completed_wo' => $woStats->sum('completed_wo'),
                'completion_rate' => $woStats->sum('total_wo') > 0 ? round(($woStats->sum('completed_wo') / $woStats->sum('total_wo')) * 100) : 0,
                'total_cost' => $woStats->sum('total_cost'),
            ],
            'by_status' => $byStatus,
            'details' => $woStats->values(),
        ]);
    }

    private function breakdownReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $bdStats = DB::table('breakdown_reports as b')
            ->join('assets as a', 'b.asset_id', '=', 'a.id')
            ->whereBetween('b.created_at', [$fromTs, $toTs])
            ->select(
                'a.code',
                'a.name',
                DB::raw('COUNT(b.id) as total_breakdowns'),
                DB::raw('SUM(CASE WHEN b.status = "processed" THEN 1 ELSE 0 END) as processed_breakdowns')
            )
            ->groupBy('a.id', 'a.code', 'a.name')
            ->get();

        $daily = DB::table('breakdown_reports')
            ->whereBetween('created_at', [$fromTs, $toTs])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('COUNT(id) as count'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chartData = [];
        $period = CarbonPeriod::create($start, $end);
        foreach ($period as $date) {
            $d = $date->toDateString();
            $chartData[] = ['date' => $date->format('j M'), 'count' => $daily[$d]->count ?? 0];
        }

        return response()->json([
            'summary' => [
                'total_breakdowns' => $bdStats->sum('total_breakdowns'),
                'processed' => $bdStats->sum('processed_breakdowns'),
                'avg_per_asset' => $bdStats->count() > 0 ? round($bdStats->sum('total_breakdowns') / $bdStats->count(), 1) : 0,
            ],
            'chart' => $chartData,
            'details' => $bdStats->values(),
        ]);
    }

    private function costReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $costStats = DB::table('work_orders as w')
            ->join('assets as a', 'w.asset_id', '=', 'a.id')
            ->whereBetween('w.actual_end', [$fromTs, $toTs])
            ->where('w.status', 'completed')
            ->whereNotNull('w.actual_cost')
            ->select(
                'a.code',
                'a.name',
                DB::raw('COUNT(w.id) as completed_wo'),
                DB::raw('SUM(w.actual_cost) as total_cost')
            )
            ->groupBy('a.id', 'a.code', 'a.name')
            ->get();

        return response()->json([
            'summary' => [
                'total_cost' => $costStats->sum('total_cost'),
                'avg_cost_per_wo' => $costStats->sum('completed_wo') > 0 ? round($costStats->sum('total_cost') / $costStats->sum('completed_wo')) : 0,
                'total_wo' => $costStats->sum('completed_wo'),
            ],
            'details' => $costStats->values(),
        ]);
    }

    private function utilizationReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('work_orders as wo')
            ->join('assets as a', 'a.id', '=', 'wo.asset_id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->select(
                'a.code',
                'a.name',
                DB::raw('COUNT(wo.id) as total_wo'),
                DB::raw('SUM(CASE WHEN wo.status = "completed" THEN 1 ELSE 0 END) as completed_wo'),
                DB::raw('AVG(CASE WHEN wo.actual_start IS NOT NULL AND wo.actual_end IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, wo.actual_start, wo.actual_end) END) as avg_service_minutes')
            )
            ->groupBy('a.id', 'a.code', 'a.name')
            ->orderByDesc('total_wo')
            ->get();

        return response()->json([
            'summary' => [
                'assets_count' => $details->count(),
                'total_wo' => (int) $details->sum('total_wo'),
                'total_completed_wo' => (int) $details->sum('completed_wo'),
                'avg_service_minutes' => (int) round($details->avg('avg_service_minutes') ?? 0),
            ],
            'details' => $details,
        ]);
    }

    private function mechanicReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('work_order_assignees as wa')
            ->join('users as u', 'u.id', '=', 'wa.user_id')
            ->join('work_orders as wo', 'wo.id', '=', 'wa.wo_id')
            ->leftJoin('wo_process_step_logs as sl', function ($join) {
                $join->on('sl.wo_id', '=', 'wo.id')->on('sl.performed_by', '=', 'u.id');
            })
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->select(
                'u.id as mechanic_id',
                'u.name as mechanic_name',
                DB::raw('COUNT(DISTINCT wo.id) as total_wo'),
                DB::raw('SUM(CASE WHEN wo.status = "completed" THEN 1 ELSE 0 END) as completed_wo'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as total_downtime_minutes'),
                DB::raw('SUM(COALESCE(sl.rework_count, 0)) as total_rework'),
                DB::raw('SUM(CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL AND sl.actual_minutes <= sl.est_minutes THEN 1 ELSE 0 END) as sla_on_time_steps'),
                DB::raw('SUM(CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL THEN 1 ELSE 0 END) as measured_steps')
            )
            ->groupBy('u.id', 'u.name')
            ->orderByDesc('completed_wo')
            ->get()
            ->map(function ($row) {
                $slaRate = ((int) $row->measured_steps) > 0 ? round(((int) $row->sla_on_time_steps / (int) $row->measured_steps) * 100) : 0;
                $reworkPenalty = min(100, (int) $row->total_rework * 5);
                $downtimePenalty = min(100, (int) round(((int) $row->total_downtime_minutes) / 30));
                $score = max(0, min(100,
                    ((int) $row->completed_wo * 5)
                    + ($slaRate * 0.5)
                    + (100 - $reworkPenalty) * 0.3
                    + (100 - $downtimePenalty) * 0.2
                ));
                $row->sla_rate = $slaRate;
                $row->balanced_score = round($score);
                return $row;
            });

        return response()->json([
            'summary' => [
                'mechanics_count' => $details->count(),
                'total_completed_wo' => (int) $details->sum('completed_wo'),
                'avg_sla_rate' => (int) round($details->avg('sla_rate') ?? 0),
                'avg_balanced_score' => (int) round($details->avg('balanced_score') ?? 0),
            ],
            'details' => $details,
        ]);
    }

    private function woHistoryReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('work_orders as wo')
            ->join('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('users as sup', 'sup.id', '=', 'wo.supervisor_id')
            ->leftJoin('wo_process_step_logs as sl', 'sl.wo_id', '=', 'wo.id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->when($request->filled('status'), fn ($q) => $q->where('wo.status', $request->string('status')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                'wo.id as wo_id',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'wo.type as wo_type',
                'wo.status as wo_status',
                'wo.priority',
                'wo.actual_start',
                'wo.actual_end',
                'a.code as asset_code',
                'a.name as asset_name',
                'sup.name as supervisor_name',
                DB::raw('SUM(COALESCE(sl.est_minutes, 0)) as total_est_minutes'),
                DB::raw('SUM(COALESCE(sl.actual_minutes, 0)) as total_actual_minutes'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as total_downtime_minutes'),
                DB::raw('SUM(CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL AND sl.actual_minutes > sl.est_minutes THEN 1 ELSE 0 END) as late_steps')
            )
            ->groupBy('wo.id', 'wo.code', 'wo.sap_reference_no', 'wo.type', 'wo.status', 'wo.priority', 'wo.actual_start', 'wo.actual_end', 'a.code', 'a.name', 'sup.name')
            ->orderByDesc('wo.id')
            ->get()
            ->map(function ($row) {
                $row->downtime_estimated_minutes = (int) $row->total_est_minutes;
                $row->downtime_gap_minutes = (int) $row->total_downtime_minutes - (int) $row->downtime_estimated_minutes;
                return $row;
            });

        return response()->json([
            'summary' => [
                'total_wo' => $details->count(),
                'completed_wo' => (int) $details->where('wo_status', 'completed')->count(),
                'total_downtime_actual_minutes' => (int) $details->sum('total_downtime_minutes'),
                'total_downtime_estimated_minutes' => (int) $details->sum('downtime_estimated_minutes'),
            ],
            'details' => $details,
        ]);
    }

    private function workshopStepControlReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('wo_process_step_logs as sl')
            ->join('work_orders as wo', 'wo.id', '=', 'sl.wo_id')
            ->join('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('users as u', 'u.id', '=', 'sl.performed_by')
            ->whereBetween('sl.created_at', [$fromTs, $toTs])
            ->when($request->filled('step_code'), fn ($q) => $q->where('sl.step_code', $request->string('step_code')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                'wo.code as wo_code',
                'a.code as asset_code',
                'a.name as asset_name',
                'sl.step_order',
                'sl.step_code',
                'sl.step_name',
                'sl.status',
                'sl.process_in_at',
                'sl.process_out_at',
                'sl.est_minutes',
                'sl.actual_minutes',
                'sl.downtime_minutes',
                'sl.rework_count',
                'u.name as mechanic_name',
                DB::raw('CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL THEN CAST(sl.actual_minutes AS SIGNED) - CAST(sl.est_minutes AS SIGNED) ELSE 0 END as variance_minutes')
            )
            ->orderByDesc('sl.id')
            ->get();

        return response()->json([
            'summary' => [
                'total_steps' => $details->count(),
                'late_steps' => $details->filter(fn ($x) => (int) $x->variance_minutes > 0)->count(),
                'total_downtime_minutes' => (int) $details->sum('downtime_minutes'),
                'avg_actual_minutes' => (int) round($details->avg('actual_minutes') ?? 0),
            ],
            'details' => $details,
        ]);
    }

    private function serviceHistoryReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('work_orders as wo')
            ->join('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('work_order_assignees as wa', 'wa.wo_id', '=', 'wo.id')
            ->leftJoin('users as mech', 'mech.id', '=', 'wa.user_id')
            ->leftJoin('wo_parts_usage as pu', 'pu.wo_id', '=', 'wo.id')
            ->leftJoin('spare_parts as sp', 'sp.id', '=', 'pu.part_id')
            ->leftJoin('wo_process_step_logs as sl', 'sl.wo_id', '=', 'wo.id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->when($request->filled('status'), fn ($q) => $q->where('wo.status', $request->string('status')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                'wo.code as wo_code',
                'wo.type as wo_type',
                'wo.status as wo_status',
                'a.code as asset_code',
                'a.name as asset_name',
                'mech.name as mechanic_name',
                'sp.code as part_code',
                'sp.name as part_name',
                DB::raw('SUM(COALESCE(pu.qty_used, 0)) as qty_used'),
                DB::raw('SUM(COALESCE(pu.qty_used, 0) * COALESCE(pu.unit_price, 0)) as part_cost'),
                DB::raw('SUM(COALESCE(sl.actual_minutes, 0)) as total_actual_minutes'),
                DB::raw('SUM(COALESCE(sl.est_minutes, 0)) as total_est_minutes'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as total_downtime_minutes')
            )
            ->groupBy('wo.code', 'wo.type', 'wo.status', 'a.code', 'a.name', 'mech.name', 'sp.code', 'sp.name')
            ->orderByDesc('wo.code')
            ->get()
            ->map(function ($row) {
                $row->delay_minutes = (int) $row->total_actual_minutes - (int) $row->total_est_minutes;
                $row->delay_reason = (int) $row->delay_minutes > 0 ? 'Over SLA Step' : 'On Time';
                return $row;
            });

        return response()->json([
            'summary' => [
                'total_records' => $details->count(),
                'total_part_cost' => (float) $details->sum('part_cost'),
                'total_downtime_minutes' => (int) $details->sum('total_downtime_minutes'),
                'late_records' => $details->filter(fn ($x) => (int) $x->delay_minutes > 0)->count(),
            ],
            'details' => $details,
        ]);
    }

    private function downtimeAnalysisReport(Request $request)
    {
        [$start, $end] = $this->getDateRange($request);
        [$fromTs, $toTs] = $this->dateRangeTimestamp($start, $end);

        $details = DB::table('work_orders as wo')
            ->join('assets as a', 'a.id', '=', 'wo.asset_id')
            ->leftJoin('wo_process_step_logs as sl', 'sl.wo_id', '=', 'wo.id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                'wo.code as wo_code',
                'a.code as asset_code',
                'a.name as asset_name',
                DB::raw('SUM(COALESCE(sl.est_minutes, 0)) as estimated_downtime_minutes'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as actual_downtime_minutes')
            )
            ->groupBy('wo.code', 'a.code', 'a.name')
            ->orderByDesc('actual_downtime_minutes')
            ->get()
            ->map(function ($row) {
                $row->downtime_gap_minutes = (int) $row->actual_downtime_minutes - (int) $row->estimated_downtime_minutes;
                return $row;
            });

        $daily = DB::table('wo_process_step_logs')
            ->whereBetween('created_at', [$fromTs, $toTs])
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('SUM(COALESCE(downtime_minutes,0)) as downtime'))
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        $period = CarbonPeriod::create($start, $end);
        foreach ($period as $date) {
            $d = $date->toDateString();
            $chart[] = ['date' => $date->format('j M'), 'count' => (int) ($daily[$d]->downtime ?? 0)];
        }

        return response()->json([
            'summary' => [
                'total_wo' => $details->count(),
                'estimated_downtime_minutes' => (int) $details->sum('estimated_downtime_minutes'),
                'actual_downtime_minutes' => (int) $details->sum('actual_downtime_minutes'),
                'total_gap_minutes' => (int) $details->sum('downtime_gap_minutes'),
            ],
            'chart' => $chart,
            'details' => $details,
        ]);
    }

    private function reportPayloadByType(string $type, string $start, string $end): array
    {
        $requestObj = Request::create('/api/v1/reports/data', 'GET', [
            'type' => $type,
            'start' => $start,
            'end' => $end,
        ]);

        $response = $this->data($requestObj);
        return json_decode($response->getContent(), true) ?: [];
    }

    public function exportExcel(Request $request)
    {
        $type = (string) $request->query('type', 'p2h');
        $start = (string) $request->query('start', now()->startOfMonth()->toDateString());
        $end = (string) $request->query('end', now()->endOfMonth()->toDateString());

        $payload = $this->reportPayloadByType($type, $start, $end);
        $details = $payload['details'] ?? [];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Report');

        $headersByType = [
            'p2h' => ['Unit Code', 'Unit Name', 'Total Days', 'Done', 'Missed', 'Findings', 'Compliance Rate'],
            'wo' => ['Unit Code', 'Unit Name', 'Total WO', 'Completed WO', 'Total Cost'],
            'breakdown' => ['Unit Code', 'Unit Name', 'Total Breakdown', 'Processed Breakdown'],
            'cost' => ['Unit Code', 'Unit Name', 'Completed WO', 'Total Cost'],
            'utilization' => ['Unit Code', 'Unit Name', 'Total WO', 'Completed WO', 'Avg Service Minutes'],
            'mechanic' => ['Mechanic', 'Total WO', 'Completed WO', 'SLA Rate', 'Balanced Score', 'Downtime Minutes', 'Rework'],
            'wo-history' => ['WO Code', 'SAP Ref', 'Unit', 'WO Type', 'Status', 'Est Minutes', 'Actual Minutes', 'Downtime', 'Downtime Est', 'Downtime Gap'],
            'workshop-step-control' => ['WO Code', 'Unit', 'Step Code', 'Step Name', 'Status', 'Start', 'End', 'SLA', 'Actual', 'Variance', 'Downtime', 'Rework', 'Mechanic'],
            'service-history' => ['WO Code', 'Unit', 'WO Type', 'Status', 'Mechanic', 'Part Code', 'Part Name', 'Qty Used', 'Part Cost', 'Total Actual', 'Total Est', 'Delay', 'Delay Reason'],
            'downtime-analysis' => ['WO Code', 'Unit', 'Estimated Downtime', 'Actual Downtime', 'Gap'],
        ];

        $headers = $headersByType[$type] ?? ['Data'];
        foreach ($headers as $index => $header) {
            $sheet->setCellValueByColumnAndRow($index + 1, 1, $header);
        }

        $rowNum = 2;
        foreach ($details as $item) {
            $values = match ($type) {
                'p2h' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_days'] ?? 0, $item['done'] ?? 0, $item['missed'] ?? 0, $item['findings'] ?? 0, ($item['rate'] ?? 0) . '%'],
                'wo' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['total_cost'] ?? 0],
                'breakdown' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_breakdowns'] ?? 0, $item['processed_breakdowns'] ?? 0],
                'cost' => [$item['code'] ?? '', $item['name'] ?? '', $item['completed_wo'] ?? 0, $item['total_cost'] ?? 0],
                'utilization' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['avg_service_minutes'] ?? 0],
                'mechanic' => [$item['mechanic_name'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['sla_rate'] ?? 0, $item['balanced_score'] ?? 0, $item['total_downtime_minutes'] ?? 0, $item['total_rework'] ?? 0],
                'wo-history' => [$item['wo_code'] ?? '', $item['sap_reference_no'] ?? '', $item['asset_name'] ?? '', $item['wo_type'] ?? '', $item['wo_status'] ?? '', $item['total_est_minutes'] ?? 0, $item['total_actual_minutes'] ?? 0, $item['total_downtime_minutes'] ?? 0, $item['downtime_estimated_minutes'] ?? 0, $item['downtime_gap_minutes'] ?? 0],
                'workshop-step-control' => [$item['wo_code'] ?? '', $item['asset_name'] ?? '', $item['step_code'] ?? '', $item['step_name'] ?? '', $item['status'] ?? '', $item['process_in_at'] ?? '', $item['process_out_at'] ?? '', $item['est_minutes'] ?? 0, $item['actual_minutes'] ?? 0, $item['variance_minutes'] ?? 0, $item['downtime_minutes'] ?? 0, $item['rework_count'] ?? 0, $item['mechanic_name'] ?? ''],
                'service-history' => [$item['wo_code'] ?? '', $item['asset_name'] ?? '', $item['wo_type'] ?? '', $item['wo_status'] ?? '', $item['mechanic_name'] ?? '', $item['part_code'] ?? '', $item['part_name'] ?? '', $item['qty_used'] ?? 0, $item['part_cost'] ?? 0, $item['total_actual_minutes'] ?? 0, $item['total_est_minutes'] ?? 0, $item['delay_minutes'] ?? 0, $item['delay_reason'] ?? ''],
                'downtime-analysis' => [$item['wo_code'] ?? '', $item['asset_name'] ?? '', $item['estimated_downtime_minutes'] ?? 0, $item['actual_downtime_minutes'] ?? 0, $item['downtime_gap_minutes'] ?? 0],
                default => [json_encode($item)],
            };

            foreach ($values as $index => $value) {
                $sheet->setCellValueByColumnAndRow($index + 1, $rowNum, $value);
            }
            $rowNum++;
        }

        $writer = new Xlsx($spreadsheet);
        $fileName = 'Report_' . strtoupper(str_replace('-', '_', $type)) . '_' . date('Ymd_His') . '.xlsx';

        return new StreamedResponse(function () use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="' . $fileName . '"',
        ]);
    }
}
