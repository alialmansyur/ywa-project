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
    private const WORKSHOP_STEP_CONTROL_FORM_KEY_ORDER = [
        'form_pre_wash_condition',
        'form_post_wash_condition',
        'form_visual_note',
        'form_inspection_result',
        'form_work_plan',
        'form_checkpoint_result',
        'form_proceed_status',
        'form_checking_summary',
        'form_waiting_type',
        'form_waiting_reason',
        'form_jobcard_confirmation',
        'form_repair_action',
        'form_technical_action',
        'form_obstacle',
        'form_hold_reason',
        'form_qc_result',
        'form_qc_parameter',
        'form_rework_note',
        'form_closing_status',
        'form_document_completeness',
        'form_handover_confirmation',
        'form_receiver',
        'form_sap_reference_no',
    ];

    private const WORKSHOP_STEP_CONTROL_EXPORT_KEYS = [
        'regis_code',
        'wo_code',
        'sap_reference_no',
        'wo_type',
        'wo_status',
        'asset_code',
        'asset_name',
        'step_order',
        'step_code',
        'step_name',
        'status',
        'process_in_at',
        'process_out_at',
        'est_minutes',
        'actual_minutes',
        'variance_minutes',
        'downtime_minutes',
        'rework_count',
        'mechanic_name',
        'notes',
        'bay_in',
        'bay_in_at',
        'bay_out_at',
        'queue_minutes',
        'station_form_summary',
    ];

    private const WORKSHOP_STEP_CONTROL_COLUMN_LABELS = [
        'regis_code' => 'Kode Registrasi',
        'wo_code' => 'WO Code',
        'sap_reference_no' => 'No Referensi SAP',
        'wo_type' => 'Tipe WO',
        'wo_status' => 'Status WO',
        'asset_code' => 'Kode Unit',
        'asset_name' => 'Nama Unit',
        'step_order' => 'Urutan Step',
        'step_code' => 'Kode Step',
        'step_name' => 'Nama Step',
        'status' => 'Status Step',
        'process_in_at' => 'Waktu Masuk Step',
        'process_out_at' => 'Waktu Keluar Step',
        'est_minutes' => 'Estimasi Menit',
        'actual_minutes' => 'Aktual Menit',
        'variance_minutes' => 'Selisih Menit',
        'downtime_minutes' => 'Downtime Menit',
        'rework_count' => 'Jumlah Rework',
        'mechanic_name' => 'Nama Mekanik',
        'notes' => 'Catatan Mekanik',
        'bay_in' => 'Bay',
        'bay_in_at' => 'Waktu Masuk Bay',
        'bay_out_at' => 'Waktu Keluar Bay',
        'queue_minutes' => 'Durasi Queue Menit',
        'station_form_summary' => 'Ringkasan Form Station',
        'form_pre_wash_condition' => 'Form Washing - Kondisi Sebelum Cuci',
        'form_post_wash_condition' => 'Form Washing - Kondisi Sesudah Cuci',
        'form_visual_note' => 'Form Washing - Catatan Visual',
        'form_inspection_result' => 'Form Inspection - Hasil Inspeksi',
        'form_work_plan' => 'Form Inspection - Rencana Pekerjaan',
        'form_checkpoint_result' => 'Form Checking - Hasil Checkpoint',
        'form_proceed_status' => 'Form Checking - Status Lanjut',
        'form_checking_summary' => 'Form Checking - Ringkasan Temuan',
        'form_waiting_type' => 'Form Waiting - Jenis Waiting',
        'form_waiting_reason' => 'Form Waiting - Alasan Waiting',
        'form_jobcard_confirmation' => 'Form Create WO - Konfirmasi Jobcard',
        'form_repair_action' => 'Form Repair - Aksi Perbaikan',
        'form_technical_action' => 'Form Repair - Tindakan Teknis',
        'form_obstacle' => 'Form Repair - Kendala',
        'form_hold_reason' => 'Form Repair - Detail Kendala',
        'form_qc_result' => 'Form QC - Hasil QC',
        'form_qc_parameter' => 'Form QC - Parameter QC',
        'form_rework_note' => 'Form QC - Catatan Rework',
        'form_closing_status' => 'Form Ready Close - Status Closing',
        'form_document_completeness' => 'Form Ready Close - Kelengkapan Dokumen',
        'form_handover_confirmation' => 'Form Handover - Konfirmasi Serah Terima',
        'form_receiver' => 'Form Handover - Nama Penerima',
        'form_sap_reference_no' => 'Form Create WO - No Referensi SAP',
    ];

    private function compositeStepKey(mixed $woId, mixed $stepOrder): string
    {
        return (string) $woId . ':' . (string) $stepOrder;
    }

    private function normalizeReportValue(mixed $value): string|int|float|null
    {
        if ($value === null) {
            return null;
        }

        if (is_bool($value)) {
            return $value ? 'true' : 'false';
        }

        if (is_scalar($value)) {
            return is_string($value) ? trim($value) : $value;
        }

        if (is_array($value)) {
            $parts = [];
            foreach ($value as $itemKey => $itemValue) {
                $normalized = $this->normalizeReportValue($itemValue);
                if ($normalized === null || $normalized === '') {
                    continue;
                }

                $parts[] = is_string($itemKey)
                    ? str_replace('_', ' ', $itemKey) . ': ' . $normalized
                    : (string) $normalized;
            }

            return implode(', ', $parts);
        }

        return trim((string) $value);
    }

    private function flattenStationData(array $stationData): array
    {
        $flattened = [];

        foreach ($stationData as $key => $value) {
            $normalized = $this->normalizeReportValue($value);
            if ($normalized === null || $normalized === '') {
                continue;
            }

            $safeKey = preg_replace('/[^a-z0-9_]+/i', '_', strtolower((string) $key));
            $safeKey = trim((string) $safeKey, '_');
            if ($safeKey === '') {
                continue;
            }

            $flattened['form_' . $safeKey] = $normalized;
        }

        ksort($flattened);

        return $flattened;
    }

    private function labelizeColumn(string $key): string
    {
        if (isset(self::WORKSHOP_STEP_CONTROL_COLUMN_LABELS[$key])) {
            return self::WORKSHOP_STEP_CONTROL_COLUMN_LABELS[$key];
        }

        return ucwords(str_replace('_', ' ', $key));
    }

    private function workshopStepControlExportKeys(array $details): array
    {
        $formKeys = [];
        foreach ($details as $row) {
            if (! is_array($row)) {
                continue;
            }

            foreach (array_keys($row) as $key) {
                if (str_starts_with((string) $key, 'form_')) {
                    $formKeys[$key] = true;
                }
            }
        }

        $orderedFormKeys = [];
        foreach (self::WORKSHOP_STEP_CONTROL_FORM_KEY_ORDER as $key) {
            if (isset($formKeys[$key])) {
                $orderedFormKeys[] = $key;
                unset($formKeys[$key]);
            }
        }

        if ($formKeys !== []) {
            $remainingFormKeys = array_keys($formKeys);
            sort($remainingFormKeys);
            $orderedFormKeys = array_merge($orderedFormKeys, $remainingFormKeys);
        }

        return array_merge(self::WORKSHOP_STEP_CONTROL_EXPORT_KEYS, $orderedFormKeys);
    }

    private function summarizeStationData(array $stationData): string
    {
        if ($stationData === []) {
            return '';
        }

        $parts = [];
        foreach ($stationData as $key => $value) {
            $rendered = $this->normalizeReportValue($value);

            if ($rendered === null || $rendered === '') {
                continue;
            }

            $parts[] = str_replace('_', ' ', (string) $key) . ': ' . $rendered;
        }

        return implode(' | ', $parts);
    }

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

    private function writeSheetRows(\PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet, array $headers, array $rows): void
    {
        foreach ($headers as $index => $header) {
            $sheet->setCellValue([$index + 1, 1], $header);
        }

        $rowNum = 2;
        foreach ($rows as $row) {
            foreach ($row as $index => $value) {
                $sheet->setCellValue([$index + 1, $rowNum], $value);
            }
            $rowNum++;
        }
    }

    private function buildSummaryRows(array $summary): array
    {
        $rows = [];
        foreach ($summary as $key => $value) {
            $rows[] = [
                $this->labelizeColumn((string) $key),
                is_scalar($value) || $value === null ? $value : json_encode($value),
            ];
        }

        return $rows;
    }

    private function buildFilterRows(string $type, string $start, string $end, Request $request): array
    {
        return [
            ['Report Type', $type],
            ['Start Date', $start],
            ['End Date', $end],
            ['Status WO', $request->query('status', '')],
            ['WO Type', $request->query('wo_type', '')],
            ['Step Code', $request->query('step_code', '')],
            ['Exported At', now()->toDateTimeString()],
        ];
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
            ->leftJoin('asset_categories as ac', 'a.category_id', '=', 'ac.id')
            ->leftJoin('p2h_items as i', 'i.submission_id', '=', 'p.id')
            ->whereBetween('p.created_at', [$fromTs, $toTs])
            ->select(
                'a.id as asset_id',
                'a.code',
                'a.name',
                'a.status as asset_status',
                'ac.name as category_name',
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number) as license_plate'),
                DB::raw('COUNT(DISTINCT p.id) as done'),
                DB::raw('SUM(CASE WHEN p.status = "approved" THEN 1 ELSE 0 END) as approved'),
                DB::raw('SUM(CASE WHEN p.status = "rejected" THEN 1 ELSE 0 END) as rejected'),
                DB::raw('SUM(CASE WHEN p.status = "submitted" THEN 1 ELSE 0 END) as pending_review'),
                DB::raw('SUM(CASE WHEN i.condition = "not_ok" THEN 1 ELSE 0 END) as findings'),
                DB::raw('SUM(CASE WHEN i.notes IS NOT NULL AND TRIM(i.notes) <> "" THEN 1 ELSE 0 END) as item_notes_count'),
                DB::raw('MAX(COALESCE(p.submission_date, DATE(p.created_at))) as last_submission_date')
            )
            ->groupBy('a.id', 'a.code', 'a.name', 'a.status', 'ac.name', DB::raw('COALESCE(a.veh_plate_no, a.plate_number)'))
            ->orderByDesc('done')
            ->get();

        $details = DB::table('p2h_submissions as p')
            ->join('assets as a', 'p.asset_id', '=', 'a.id')
            ->leftJoin('asset_categories as ac', 'a.category_id', '=', 'ac.id')
            ->leftJoin('users as op', 'p.operator_id', '=', 'op.id')
            ->leftJoin('users as rev', 'p.reviewed_by', '=', 'rev.id')
            ->leftJoin('p2h_templates as t', 'p.template_id', '=', 't.id')
            ->leftJoin('p2h_items as i', 'i.submission_id', '=', 'p.id')
            ->whereBetween('p.created_at', [$fromTs, $toTs])
            ->select(
                'p.id',
                DB::raw('CONCAT("P2H-", p.id) as code'),
                'p.status',
                'p.submission_date',
                'p.submitted_at',
                'p.reviewed_at',
                'p.review_notes',
                'a.code as asset_code',
                'a.name as asset_name',
                'a.status as asset_status',
                'ac.name as category_name',
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number) as license_plate'),
                'op.name as operator_name',
                'rev.name as reviewer_name',
                't.name as template_name',
                DB::raw('SUM(CASE WHEN i.condition = "not_ok" THEN 1 ELSE 0 END) as findings'),
                DB::raw('SUM(CASE WHEN i.notes IS NOT NULL AND TRIM(i.notes) <> "" THEN 1 ELSE 0 END) as item_notes_count'),
                DB::raw('COUNT(i.id) as total_items')
            )
            ->groupBy(
                'p.id',
                'p.status',
                'p.submission_date',
                'p.submitted_at',
                'p.reviewed_at',
                'p.review_notes',
                'a.code',
                'a.name',
                'a.status',
                'ac.name',
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number)'),
                'op.name',
                'rev.name',
                't.name'
            )
            ->orderByDesc('p.submission_date')
            ->orderByDesc('p.created_at')
            ->get();

        $latestSubmissionMap = collect();
        if ($p2hStats->isNotEmpty()) {
            $latestSubmissionSubquery = DB::table('p2h_submissions')
                ->whereBetween('created_at', [$fromTs, $toTs])
                ->selectRaw('asset_id, MAX(id) as latest_id')
                ->groupBy('asset_id');

            $latestSubmissionIds = DB::table('p2h_submissions as p')
                ->joinSub($latestSubmissionSubquery, 'latest', function ($join) {
                    $join->on('latest.latest_id', '=', 'p.id');
                })
                ->pluck('p.id');

            $latestSubmissionMap = DB::table('p2h_submissions as p')
                ->leftJoin('users as op', 'op.id', '=', 'p.operator_id')
                ->leftJoin('users as rev', 'rev.id', '=', 'p.reviewed_by')
                ->whereIn('p.id', $latestSubmissionIds)
                ->get([
                    'p.asset_id',
                    'p.status as last_status',
                    'p.review_notes',
                    'p.submission_date',
                    'p.submitted_at',
                    'p.reviewed_at',
                    'op.name as last_operator_name',
                    'rev.name as last_reviewer_name',
                ])
                ->keyBy('asset_id');
        }

        $p2hStats = $p2hStats->map(function ($item) use ($latestSubmissionMap, $totalDays) {
            $latestSubmission = $latestSubmissionMap->get($item->asset_id);
            $item->total_days = $totalDays;
            $item->missed = max(0, $totalDays - $item->done);
            $item->rate = ($totalDays > 0) ? round(($item->done / $totalDays) * 100) : 0;
            $item->compliance_gap = (int) $item->done - $totalDays;
            $item->color = $item->rate >= 90 ? 'green' : ($item->rate >= 75 ? 'yellow' : 'red');
            $item->last_status = $latestSubmission->last_status ?? null;
            $item->last_operator_name = $latestSubmission->last_operator_name ?? null;
            $item->last_reviewer_name = $latestSubmission->last_reviewer_name ?? null;
            $item->last_review_notes = $latestSubmission->review_notes ?? null;
            $item->last_submitted_at = $latestSubmission->submitted_at ?? null;
            $item->last_reviewed_at = $latestSubmission->reviewed_at ?? null;
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
                'pending_review' => $p2hStats->sum('pending_review'),
                'assets_monitored' => $p2hStats->count(),
            ],
            'chart' => $chartData,
            'details' => $details->values(),
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
            ->leftJoin('asset_categories as ac', 'a.category_id', '=', 'ac.id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->select(
                'a.id as asset_id',
                'a.code',
                'a.name',
                'a.status as asset_status',
                'ac.name as category_name',
                DB::raw('COALESCE(a.veh_plate_no, a.plate_number) as license_plate'),
                DB::raw('COUNT(wo.id) as total_wo'),
                DB::raw('SUM(CASE WHEN wo.status = "completed" THEN 1 ELSE 0 END) as completed_wo'),
                DB::raw('SUM(CASE WHEN wo.status NOT IN ("completed", "cancelled") THEN 1 ELSE 0 END) as open_wo'),
                DB::raw('SUM(CASE WHEN wo.type = "preventive" THEN 1 ELSE 0 END) as preventive_wo'),
                DB::raw('SUM(CASE WHEN wo.type = "corrective" THEN 1 ELSE 0 END) as corrective_wo'),
                DB::raw('SUM(CASE WHEN wo.type = "breakdown" THEN 1 ELSE 0 END) as breakdown_wo'),
                DB::raw('SUM(CASE WHEN wo.type = "inspection" THEN 1 ELSE 0 END) as inspection_wo'),
                DB::raw('SUM(CASE WHEN wo.actual_start IS NOT NULL AND wo.actual_end IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, wo.actual_start, wo.actual_end) ELSE 0 END) as total_service_minutes'),
                DB::raw('AVG(CASE WHEN wo.actual_start IS NOT NULL AND wo.actual_end IS NOT NULL THEN TIMESTAMPDIFF(MINUTE, wo.actual_start, wo.actual_end) END) as avg_service_minutes')
            )
            ->groupBy('a.id', 'a.code', 'a.name', 'a.status', 'ac.name', DB::raw('COALESCE(a.veh_plate_no, a.plate_number)'))
            ->orderByDesc('total_wo')
            ->get()
            ->map(function ($row) {
                $row->completion_rate = (int) $row->total_wo > 0
                    ? round(((int) $row->completed_wo / (int) $row->total_wo) * 100)
                    : 0;

                return $row;
            });

        $latestWorkOrderMap = collect();
        if ($details->isNotEmpty()) {
            $latestWorkOrderIds = DB::table('work_orders')
                ->whereBetween('created_at', [$fromTs, $toTs])
                ->selectRaw('MAX(id) as latest_id')
                ->groupBy('asset_id')
                ->pluck('latest_id');

            $latestWorkOrderMap = DB::table('work_orders as wo')
                ->leftJoin('users as sup', 'sup.id', '=', 'wo.supervisor_id')
                ->whereIn('wo.id', $latestWorkOrderIds)
                ->get([
                    'wo.asset_id',
                    'wo.code as last_wo_code',
                    'wo.status as last_wo_status',
                    'wo.type as last_wo_type',
                    'wo.created_at as last_wo_created_at',
                    'wo.actual_end as last_completed_at',
                    'sup.name as last_supervisor_name',
                ])
                ->keyBy('asset_id');
        }

        $details = $details->map(function ($row) use ($latestWorkOrderMap) {
            $latestWorkOrder = $latestWorkOrderMap->get($row->asset_id);
            $row->last_wo_code = $latestWorkOrder->last_wo_code ?? null;
            $row->last_wo_status = $latestWorkOrder->last_wo_status ?? null;
            $row->last_wo_type = $latestWorkOrder->last_wo_type ?? null;
            $row->last_wo_created_at = $latestWorkOrder->last_wo_created_at ?? null;
            $row->last_completed_at = $latestWorkOrder->last_completed_at ?? null;
            $row->last_supervisor_name = $latestWorkOrder->last_supervisor_name ?? null;

            return $row;
        });

        return response()->json([
            'summary' => [
                'assets_count' => $details->count(),
                'total_wo' => (int) $details->sum('total_wo'),
                'total_completed_wo' => (int) $details->sum('completed_wo'),
                'open_wo' => (int) $details->sum('open_wo'),
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
                DB::raw('COUNT(sl.id) as total_processes'),
                DB::raw('SUM(COALESCE(sl.est_minutes, 0)) as total_est_minutes'),
                DB::raw('SUM(COALESCE(sl.actual_minutes, 0)) as total_actual_minutes'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as total_downtime_minutes'),
                DB::raw('SUM(CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL AND sl.actual_minutes > sl.est_minutes THEN 1 ELSE 0 END) as late_steps')
            )
            ->groupBy('wo.id', 'wo.code', 'wo.sap_reference_no', 'wo.type', 'wo.status', 'wo.priority', 'wo.actual_start', 'wo.actual_end', 'a.code', 'a.name', 'sup.name')
            ->orderByDesc('wo.id')
            ->get()
            ->map(function ($row) {
                $row->actual_vs_sla_gap_minutes = (int) $row->total_actual_minutes - (int) $row->total_est_minutes;
                $row->avg_sla_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->total_est_minutes / (int) $row->total_processes) : 0);
                $row->avg_actual_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->total_actual_minutes / (int) $row->total_processes) : 0);
                $row->avg_gap_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->actual_vs_sla_gap_minutes / (int) $row->total_processes) : 0);
                $row->downtime_estimated_minutes = (int) $row->total_est_minutes;
                $row->downtime_gap_minutes = (int) $row->actual_vs_sla_gap_minutes;
                return $row;
            });

        return response()->json([
            'summary' => [
                'total_wo' => $details->count(),
                'completed_wo' => (int) $details->where('wo_status', 'completed')->count(),
                'total_processes' => (int) $details->sum('total_processes'),
                'total_sla_minutes' => (int) $details->sum('total_est_minutes'),
                'total_actual_minutes' => (int) $details->sum('total_actual_minutes'),
                'total_gap_minutes' => (int) $details->sum('actual_vs_sla_gap_minutes'),
                'avg_sla_minutes' => (int) round($details->avg('avg_sla_minutes') ?? 0),
                'avg_actual_minutes' => (int) round($details->avg('avg_actual_minutes') ?? 0),
                'avg_gap_minutes' => (int) round($details->avg('avg_gap_minutes') ?? 0),
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
                'wo.id as wo_id',
                'wo.code as regis_code',
                'wo.code as wo_code',
                'wo.sap_reference_no',
                'wo.type as wo_type',
                'wo.status as wo_status',
                'a.code as asset_code',
                'a.name as asset_name',
                'sl.id as step_log_id',
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
                'sl.notes',
                'sl.bay_in',
                'sl.bay_in_at',
                'sl.bay_out_at',
                'sl.queue_minutes',
                'u.name as mechanic_name',
                DB::raw('CASE WHEN sl.est_minutes IS NOT NULL AND sl.actual_minutes IS NOT NULL THEN CAST(sl.actual_minutes AS SIGNED) - CAST(sl.est_minutes AS SIGNED) ELSE 0 END as variance_minutes')
            )
            ->orderByDesc('sl.id')
            ->get();

        $eventMap = collect();
        if ($details->isNotEmpty()) {
            $woIds = $details->pluck('wo_id')->filter()->unique()->values()->all();
            $stepOrders = $details->pluck('step_order')->filter(fn ($stepOrder) => $stepOrder !== null)->unique()->values()->all();

            $events = DB::table('wo_process_events')
                ->where('event_key', 'STEP_OUT')
                ->whereIn('wo_id', $woIds)
                ->whereIn('source_step_order', $stepOrders)
                ->orderByDesc('triggered_at')
                ->orderByDesc('id')
                ->get([
                    'id',
                    'wo_id',
                    'source_step_order',
                    'payload_json',
                    'triggered_at',
                ]);

            foreach ($events as $event) {
                $key = $this->compositeStepKey($event->wo_id, $event->source_step_order);
                if ($eventMap->has($key)) {
                    continue;
                }

                $payload = is_array($event->payload_json)
                    ? $event->payload_json
                    : (json_decode((string) $event->payload_json, true) ?: []);

                $stationData = is_array($payload['station_data'] ?? null) ? $payload['station_data'] : [];

                $eventMap->put($key, [
                    'step_out_event_id' => $event->id,
                    'step_out_triggered_at' => $event->triggered_at,
                    'station_data' => $stationData,
                    'station_form_json' => $stationData !== []
                        ? json_encode($stationData, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
                        : null,
                    'station_form_summary' => $this->summarizeStationData($stationData),
                ]);
            }
        }

        $details = $details->map(function ($row) use ($eventMap) {
            $event = $eventMap->get($this->compositeStepKey($row->wo_id, $row->step_order), []);
            $stationData = is_array($event['station_data'] ?? null) ? $event['station_data'] : [];
            $flattenedStationData = $this->flattenStationData($stationData);

            $row->station_data = (object) $stationData;
            $row->station_form_json = $event['station_form_json'] ?? null;
            $row->station_form_summary = $event['station_form_summary'] ?? '';
            $row->step_out_event_id = $event['step_out_event_id'] ?? null;
            $row->step_out_triggered_at = $event['step_out_triggered_at'] ?? null;
            $row->has_station_form = $stationData !== [];

            foreach ($flattenedStationData as $field => $value) {
                $row->{$field} = $value;
            }

            return $row;
        });

        return response()->json([
            'summary' => [
                'total_steps' => $details->count(),
                'late_steps' => $details->filter(fn ($x) => (int) $x->variance_minutes > 0)->count(),
                'total_downtime_minutes' => (int) $details->sum('downtime_minutes'),
                'avg_actual_minutes' => (int) round($details->avg('actual_minutes') ?? 0),
                'steps_with_form' => $details->filter(fn ($x) => (bool) ($x->has_station_form ?? false))->count(),
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
            ->when($request->filled('status'), fn ($q) => $q->where('wo.status', $request->string('status')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                'wo.code as wo_code',
                'wo.type as wo_type',
                'wo.status as wo_status',
                'a.code as asset_code',
                'a.name as asset_name',
                DB::raw('COUNT(sl.id) as total_processes'),
                DB::raw('SUM(COALESCE(sl.est_minutes, 0)) as estimated_downtime_minutes'),
                DB::raw('SUM(COALESCE(sl.actual_minutes, 0)) as total_actual_minutes'),
                DB::raw('SUM(COALESCE(sl.downtime_minutes, 0)) as actual_downtime_minutes')
            )
            ->groupBy('wo.code', 'wo.type', 'wo.status', 'a.code', 'a.name')
            ->orderByDesc('total_actual_minutes')
            ->get()
            ->map(function ($row) {
                $row->estimated_step_minutes = (int) $row->estimated_downtime_minutes;
                $row->reported_downtime_minutes = (int) $row->actual_downtime_minutes;
                $row->actual_vs_sla_gap_minutes = (int) $row->total_actual_minutes - (int) $row->estimated_step_minutes;
                $row->avg_sla_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->estimated_step_minutes / (int) $row->total_processes) : 0);
                $row->avg_actual_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->total_actual_minutes / (int) $row->total_processes) : 0);
                $row->avg_gap_minutes = (int) round(((int) $row->total_processes) > 0 ? ((int) $row->actual_vs_sla_gap_minutes / (int) $row->total_processes) : 0);
                $row->downtime_gap_minutes = (int) $row->actual_vs_sla_gap_minutes;
                $row->reported_downtime_gap_minutes = (int) $row->actual_vs_sla_gap_minutes;
                return $row;
            });

        $daily = DB::table('work_orders as wo')
            ->leftJoin('wo_process_step_logs as sl', 'sl.wo_id', '=', 'wo.id')
            ->whereBetween('wo.created_at', [$fromTs, $toTs])
            ->when($request->filled('status'), fn ($q) => $q->where('wo.status', $request->string('status')))
            ->when($request->filled('wo_type'), fn ($q) => $q->where('wo.type', $request->string('wo_type')))
            ->select(
                DB::raw('DATE(wo.created_at) as date'),
                DB::raw('SUM(COALESCE(sl.est_minutes,0)) as total_sla_minutes'),
                DB::raw('SUM(COALESCE(sl.actual_minutes,0)) as total_actual_minutes')
            )
            ->groupBy(DB::raw('DATE(wo.created_at)'))
            ->orderBy('date')
            ->get()
            ->keyBy('date');

        $chart = [];
        $period = CarbonPeriod::create($start, $end);
        foreach ($period as $date) {
            $d = $date->toDateString();
            $actualMinutes = (int) ($daily[$d]->total_actual_minutes ?? 0);
            $slaMinutes = (int) ($daily[$d]->total_sla_minutes ?? 0);
            $chart[] = [
                'date' => $date->format('j M'),
                'count' => $actualMinutes - $slaMinutes,
                'actual_minutes' => $actualMinutes,
                'sla_minutes' => $slaMinutes,
                'gap_minutes' => $actualMinutes - $slaMinutes,
            ];
        }

        return response()->json([
            'summary' => [
                'total_wo' => $details->count(),
                'total_processes' => (int) $details->sum('total_processes'),
                'total_sla_minutes' => (int) $details->sum('estimated_step_minutes'),
                'total_actual_minutes' => (int) $details->sum('total_actual_minutes'),
                'total_gap_minutes' => (int) $details->sum('actual_vs_sla_gap_minutes'),
                'avg_sla_minutes' => (int) round($details->avg('avg_sla_minutes') ?? 0),
                'avg_actual_minutes' => (int) round($details->avg('avg_actual_minutes') ?? 0),
                'avg_gap_minutes' => (int) round($details->avg('avg_gap_minutes') ?? 0),
                'total_estimated_step_minutes' => (int) $details->sum('estimated_step_minutes'),
                'total_reported_downtime_minutes' => (int) $details->sum('reported_downtime_minutes'),
                'total_reported_downtime_gap_minutes' => (int) $details->sum('reported_downtime_gap_minutes'),
                'estimated_downtime_minutes' => (int) $details->sum('estimated_downtime_minutes'),
                'actual_downtime_minutes' => (int) $details->sum('actual_downtime_minutes'),
                'total_gap_minutes' => (int) $details->sum('downtime_gap_minutes'),
            ],
            'chart' => $chart,
            'details' => $details,
        ]);
    }

    private function reportPayloadByType(Request $request, string $type, string $start, string $end): array
    {
        $requestObj = Request::create('/api/v1/reports/data', 'GET', [
            'type' => $type,
            'start' => $start,
            'end' => $end,
            'status' => $request->query('status'),
            'wo_type' => $request->query('wo_type'),
            'step_code' => $request->query('step_code'),
        ]);

        $response = $this->data($requestObj);
        return json_decode($response->getContent(), true) ?: [];
    }

    public function exportExcel(Request $request)
    {
        $type = (string) $request->query('type', 'p2h');
        $start = (string) $request->query('start', now()->startOfMonth()->toDateString());
        $end = (string) $request->query('end', now()->endOfMonth()->toDateString());

        $payload = $this->reportPayloadByType($request, $type, $start, $end);
        $details = $payload['details'] ?? [];

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Detail');

        $headersByType = [
            'p2h' => ['Submission Date', 'P2H Code', 'Unit Code', 'Unit Name', 'Category', 'Asset Status', 'License Plate', 'Operator', 'Template', 'Status', 'Findings', 'Item Notes', 'Total Items', 'Submitted At', 'Reviewed At', 'Reviewer', 'Review Notes'],
            'wo' => ['Unit Code', 'Unit Name', 'Total WO', 'Completed WO', 'Total Cost'],
            'breakdown' => ['Unit Code', 'Unit Name', 'Total Breakdown', 'Processed Breakdown'],
            'cost' => ['Unit Code', 'Unit Name', 'Completed WO', 'Total Cost'],
            'utilization' => ['Unit Code', 'Unit Name', 'Category', 'Asset Status', 'License Plate', 'Total WO', 'Completed WO', 'Open WO', 'Preventive WO', 'Corrective WO', 'Breakdown WO', 'Inspection WO', 'Completion Rate', 'Total Service Minutes', 'Avg Service Minutes', 'Last WO Code', 'Last WO Status', 'Last WO Type', 'Last WO Created At', 'Last Completed At', 'Last Supervisor'],
            'mechanic' => ['Mechanic', 'Total WO', 'Completed WO', 'SLA Rate', 'Balanced Score', 'Downtime Minutes', 'Rework'],
            'wo-history' => ['WO Code', 'SAP Ref', 'Unit', 'WO Type', 'Status', 'Total Processes', 'Total SLA Minutes', 'Total Actual Minutes', 'Total Gap Minutes', 'Avg SLA Minutes', 'Avg Actual Minutes', 'Avg Gap Minutes', 'Total Reported Downtime Minutes', 'Estimated Step Minutes', 'Reported Downtime Gap'],
            'service-history' => ['WO Code', 'Unit', 'WO Type', 'Status', 'Mechanic', 'Part Code', 'Part Name', 'Qty Used', 'Part Cost', 'Total Actual', 'Total Est', 'Delay', 'Delay Reason'],
            'downtime-analysis' => ['WO Code', 'WO Type', 'WO Status', 'Unit Code', 'Unit', 'Total Processes', 'Total SLA Minutes', 'Total Actual Minutes', 'Total Gap Minutes', 'Avg SLA Minutes', 'Avg Actual Minutes', 'Avg Gap Minutes', 'Reported Downtime Minutes', 'Legacy Estimated Downtime', 'Legacy Actual Downtime', 'Legacy Gap'],
        ];

        $workshopStepControlKeys = $type === 'workshop-step-control'
            ? $this->workshopStepControlExportKeys($details)
            : [];

        $headers = $type === 'workshop-step-control'
            ? array_map(fn ($key) => $this->labelizeColumn($key), $workshopStepControlKeys)
            : ($headersByType[$type] ?? ['Data']);
        $rows = [];
        foreach ($details as $item) {
            $values = match ($type) {
                'p2h' => [$item['submission_date'] ?? '', $item['code'] ?? '', $item['asset_code'] ?? '', $item['asset_name'] ?? '', $item['category_name'] ?? '', $item['asset_status'] ?? '', $item['license_plate'] ?? '', $item['operator_name'] ?? '', $item['template_name'] ?? '', $item['status'] ?? '', $item['findings'] ?? 0, $item['item_notes_count'] ?? 0, $item['total_items'] ?? 0, $item['submitted_at'] ?? '', $item['reviewed_at'] ?? '', $item['reviewer_name'] ?? '', $item['review_notes'] ?? ''],
                'wo' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['total_cost'] ?? 0],
                'breakdown' => [$item['code'] ?? '', $item['name'] ?? '', $item['total_breakdowns'] ?? 0, $item['processed_breakdowns'] ?? 0],
                'cost' => [$item['code'] ?? '', $item['name'] ?? '', $item['completed_wo'] ?? 0, $item['total_cost'] ?? 0],
                'utilization' => [$item['code'] ?? '', $item['name'] ?? '', $item['category_name'] ?? '', $item['asset_status'] ?? '', $item['license_plate'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['open_wo'] ?? 0, $item['preventive_wo'] ?? 0, $item['corrective_wo'] ?? 0, $item['breakdown_wo'] ?? 0, $item['inspection_wo'] ?? 0, ($item['completion_rate'] ?? 0) . '%', $item['total_service_minutes'] ?? 0, $item['avg_service_minutes'] ?? 0, $item['last_wo_code'] ?? '', $item['last_wo_status'] ?? '', $item['last_wo_type'] ?? '', $item['last_wo_created_at'] ?? '', $item['last_completed_at'] ?? '', $item['last_supervisor_name'] ?? ''],
                'mechanic' => [$item['mechanic_name'] ?? '', $item['total_wo'] ?? 0, $item['completed_wo'] ?? 0, $item['sla_rate'] ?? 0, $item['balanced_score'] ?? 0, $item['total_downtime_minutes'] ?? 0, $item['total_rework'] ?? 0],
                'wo-history' => [$item['wo_code'] ?? '', $item['sap_reference_no'] ?? '', $item['asset_name'] ?? '', $item['wo_type'] ?? '', $item['wo_status'] ?? '', $item['total_processes'] ?? 0, $item['total_est_minutes'] ?? 0, $item['total_actual_minutes'] ?? 0, $item['actual_vs_sla_gap_minutes'] ?? ($item['downtime_gap_minutes'] ?? 0), $item['avg_sla_minutes'] ?? 0, $item['avg_actual_minutes'] ?? 0, $item['avg_gap_minutes'] ?? 0, $item['total_downtime_minutes'] ?? 0, $item['downtime_estimated_minutes'] ?? 0, $item['downtime_gap_minutes'] ?? 0],
                'workshop-step-control' => array_map(
                    fn ($key) => $item[$key] ?? '',
                    $workshopStepControlKeys
                ),
                'service-history' => [$item['wo_code'] ?? '', $item['asset_name'] ?? '', $item['wo_type'] ?? '', $item['wo_status'] ?? '', $item['mechanic_name'] ?? '', $item['part_code'] ?? '', $item['part_name'] ?? '', $item['qty_used'] ?? 0, $item['part_cost'] ?? 0, $item['total_actual_minutes'] ?? 0, $item['total_est_minutes'] ?? 0, $item['delay_minutes'] ?? 0, $item['delay_reason'] ?? ''],
                'downtime-analysis' => [$item['wo_code'] ?? '', $item['wo_type'] ?? '', $item['wo_status'] ?? '', $item['asset_code'] ?? '', $item['asset_name'] ?? '', $item['total_processes'] ?? 0, $item['estimated_step_minutes'] ?? ($item['estimated_downtime_minutes'] ?? 0), $item['total_actual_minutes'] ?? 0, $item['actual_vs_sla_gap_minutes'] ?? ($item['reported_downtime_gap_minutes'] ?? 0), $item['avg_sla_minutes'] ?? 0, $item['avg_actual_minutes'] ?? 0, $item['avg_gap_minutes'] ?? 0, $item['reported_downtime_minutes'] ?? ($item['actual_downtime_minutes'] ?? 0), $item['estimated_downtime_minutes'] ?? 0, $item['actual_downtime_minutes'] ?? 0, $item['downtime_gap_minutes'] ?? 0],
                default => [json_encode($item)],
            };
            $rows[] = $values;
        }

        $this->writeSheetRows($sheet, $headers, $rows);

        $summarySheet = $spreadsheet->createSheet();
        $summarySheet->setTitle('Summary');
        $this->writeSheetRows(
            $summarySheet,
            ['Metric', 'Value'],
            $this->buildSummaryRows($payload['summary'] ?? [])
        );

        $filtersSheet = $spreadsheet->createSheet();
        $filtersSheet->setTitle('Filters');
        $this->writeSheetRows(
            $filtersSheet,
            ['Filter', 'Value'],
            $this->buildFilterRows($type, $start, $end, $request)
        );

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
