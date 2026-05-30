<?php

namespace App\Http\Controllers\Api\V1\Schedule;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\MaintenanceSchedule;
use App\Models\WorkOrder;
use App\Models\WorkOrderStatusLog;
use App\Services\Approval\ApprovalWorkflowService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;

/**
 * @tags Schedules
 */
class ScheduleController extends Controller
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

    private function resolveOperationalStatus(MaintenanceSchedule $schedule): string
    {
        if ($schedule->status === 'completed') {
            return 'completed';
        }

        $asset = $schedule->asset;
        $now = now();
        $todayStart = $now->copy()->startOfDay();

        if ($schedule->next_due_at) {
            $dueAt = Carbon::parse($schedule->next_due_at);
            if ($dueAt->lt($todayStart)) {
                return 'overdue';
            }
            if ($dueAt->lte($now->copy()->addDays(2))) {
                return 'due';
            }
        }

        if ($asset) {
            if ($schedule->next_due_hm !== null && $asset->current_hm !== null && (float) $asset->current_hm >= (float) $schedule->next_due_hm) {
                return 'due';
            }
            if ($schedule->next_due_km !== null && $asset->current_km !== null && (float) $asset->current_km >= (float) $schedule->next_due_km) {
                return 'due';
            }
        }

        return 'scheduled';
    }

    private function normalizeScheduleStatus(MaintenanceSchedule $schedule): MaintenanceSchedule
    {
        $expected = $this->resolveOperationalStatus($schedule);
        if ($schedule->status !== $expected) {
            $schedule->status = $expected;
            $schedule->save();
        }

        return $schedule->fresh(['asset:id,name,code,current_hm,current_km']);
    }

    private function mapSchedule(MaintenanceSchedule $schedule): array
    {
        $now = now();
        $dueDate = $schedule->next_due_at ? Carbon::parse($schedule->next_due_at) : null;
        $daysLeft = $dueDate ? (int) floor($now->diffInDays($dueDate, false)) : null;

        $severity = 'info';
        if ($schedule->status === 'completed') {
            $severity = 'success';
        } elseif ($dueDate && $schedule->status !== 'completed') {
            if ($daysLeft <= 0) {
                $severity = 'danger';
            } elseif ($daysLeft <= 2) {
                $severity = 'warning';
            }
        } elseif (in_array($schedule->status, ['due', 'overdue'], true)) {
            $severity = $schedule->status === 'overdue' ? 'danger' : 'warning';
        }

        return [
            ...$schedule->toArray(),
            'days_left' => $daysLeft,
            'severity' => $severity,
            'is_due_today_or_overdue' => $dueDate ? $daysLeft <= 0 : false,
        ];
    }

    /**
     * Semua jadwal maintenance
     */
    public function index(Request $request): JsonResponse
    {
        $query = MaintenanceSchedule::query()
            ->with(['asset:id,name,code,current_hm,current_km'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->asset_id, fn ($q) => $q->where('asset_id', $request->asset_id))
            ->when($request->q, function ($q) use ($request) {
                $needle = trim((string) $request->q);
                $q->where(function ($sub) use ($needle) {
                    $sub->where('name', 'like', "%{$needle}%")
                        ->orWhereHas('asset', function ($assetQ) use ($needle) {
                            $assetQ->where('code', 'like', "%{$needle}%")
                                ->orWhere('name', 'like', "%{$needle}%");
                        });
                });
            })
            ->orderByRaw('next_due_at is null')
            ->orderBy('next_due_at');

        $perPage = (int) ($request->per_page ?? 15);
        $schedules = $query->paginate($perPage);
        $schedules->setCollection(
            $schedules->getCollection()->map(function (MaintenanceSchedule $item) {
                $normalized = $this->normalizeScheduleStatus($item);
                return $this->mapSchedule($normalized);
            })
        );

        return response()->json($schedules);
    }

    /**
     * Jadwal maintenance mendatang (7 hari ke depan)
     */
    public function upcoming(Request $request): JsonResponse
    {
        $days = $request->days ?? 7;

        $schedules = MaintenanceSchedule::with(['asset:id,name,code'])
            ->upcoming($days)
            ->orderBy('next_due_at')
            ->get();

        return response()->json([
            'upcoming_days' => $days,
            'count'         => $schedules->count(),
            'schedules'     => $schedules->map(function (MaintenanceSchedule $item) {
                $normalized = $this->normalizeScheduleStatus($item);
                return $this->mapSchedule($normalized);
            }),
        ]);
    }

    public function calendar(Request $request): JsonResponse
    {
        $year = (int) ($request->year ?: now()->year);
        $month = (int) ($request->month ?: now()->month);
        $from = Carbon::create($year, $month, 1)->startOfDay();
        $to = $from->copy()->endOfMonth()->endOfDay();

        $schedules = MaintenanceSchedule::with('asset:id,name,code')
            ->whereBetween('next_due_at', [$from, $to])
            ->get()
            ->map(function (MaintenanceSchedule $item) {
                $normalized = $this->normalizeScheduleStatus($item);
                return $this->mapSchedule($normalized);
            });

        $byDate = [];
        $eventsByDate = [];
        foreach ($schedules as $item) {
            if (!$item['next_due_at']) {
                continue;
            }
            $dateKey = Carbon::parse($item['next_due_at'])->toDateString();
            $byDate[$dateKey] ??= ['count' => 0, 'severity' => []];
            $byDate[$dateKey]['count']++;
            if (!in_array($item['severity'], $byDate[$dateKey]['severity'], true)) {
                $byDate[$dateKey]['severity'][] = $item['severity'];
            }
            $eventsByDate[$dateKey] ??= [];
            $eventsByDate[$dateKey][] = $item;
        }

        return response()->json([
            'month' => $month,
            'year' => $year,
            'range' => ['from' => $from->toDateString(), 'to' => $to->toDateString()],
            'days' => $byDate,
            'events_by_day' => $eventsByDate,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => ['required', 'exists:assets,id'],
            'type' => ['required', 'in:preventive,periodic,conditional'],
            'name' => ['required', 'string', 'max:255'],
            'interval_hm' => ['nullable', 'numeric', 'min:0'],
            'interval_km' => ['nullable', 'numeric', 'min:0'],
            'last_done_hm' => ['nullable', 'numeric', 'min:0'],
            'last_done_km' => ['nullable', 'numeric', 'min:0'],
            'last_done_at' => ['nullable', 'date'],
            'next_due_at' => ['nullable', 'date'],
            'next_due_hm' => ['nullable', 'numeric', 'min:0'],
            'next_due_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:scheduled,due,overdue,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule = MaintenanceSchedule::create([
            ...$validated,
            'status' => $validated['status'] ?? 'scheduled',
        ])->load('asset:id,name,code,current_hm,current_km');
        $schedule = $this->normalizeScheduleStatus($schedule);

        return response()->json([
            'message' => 'Jadwal maintenance berhasil ditambahkan.',
            'data' => $this->mapSchedule($schedule),
        ], 201);
    }

    public function update(Request $request, MaintenanceSchedule $schedule): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => ['nullable', 'exists:assets,id'],
            'type' => ['nullable', 'in:preventive,periodic,conditional'],
            'name' => ['nullable', 'string', 'max:255'],
            'interval_hm' => ['nullable', 'numeric', 'min:0'],
            'interval_km' => ['nullable', 'numeric', 'min:0'],
            'last_done_hm' => ['nullable', 'numeric', 'min:0'],
            'last_done_km' => ['nullable', 'numeric', 'min:0'],
            'last_done_at' => ['nullable', 'date'],
            'next_due_at' => ['nullable', 'date'],
            'next_due_hm' => ['nullable', 'numeric', 'min:0'],
            'next_due_km' => ['nullable', 'numeric', 'min:0'],
            'status' => ['nullable', 'in:scheduled,due,overdue,completed'],
            'notes' => ['nullable', 'string'],
        ]);

        $schedule->update($validated);
        $schedule->load('asset:id,name,code,current_hm,current_km');
        $schedule = $this->normalizeScheduleStatus($schedule);

        return response()->json([
            'message' => 'Jadwal maintenance berhasil diperbarui.',
            'data' => $this->mapSchedule($schedule),
        ]);
    }

    public function destroy(MaintenanceSchedule $schedule): JsonResponse
    {
        $schedule->delete();

        return response()->json(['message' => 'Jadwal maintenance dihapus.']);
    }

    public function createWorkOrder(Request $request, MaintenanceSchedule $schedule): JsonResponse
    {
        $validated = $request->validate([
            'supervisor_id' => ['nullable', 'exists:users,id'],
            'priority' => ['nullable', 'in:low,medium,high,critical'],
            'description' => ['nullable', 'string'],
            'force' => ['nullable', 'boolean'],
        ]);

        $asset = Asset::findOrFail($schedule->asset_id);
        $dueLabel = $schedule->next_due_at ? Carbon::parse($schedule->next_due_at)->format('d/m/Y') : '-';
        $title = sprintf('%s - %s (%s)', $schedule->name, $asset->code, $dueLabel);

        $hasOpenWo = WorkOrder::query()
            ->where('schedule_id', $schedule->id)
            ->where('type', 'preventive')
            ->whereIn('status', ['draft', 'pending', 'approved', 'in_progress', 'on_hold'])
            ->exists();

        if ($hasOpenWo && !($validated['force'] ?? false)) {
            return response()->json([
                'message' => 'WO untuk jadwal ini sudah ada dan masih aktif. Gunakan force=true jika ingin tetap membuat WO baru.',
            ], 422);
        }

        $approvalTemplate = $request->attributes->get('approval.template');
        $wo = DB::transaction(function () use ($request, $validated, $asset, $schedule, $title, $approvalTemplate) {
            $initialStatus = $approvalTemplate ? 'draft' : 'pending';

            $wo = WorkOrder::create([
                'code' => 'WO-' . now()->format('Ymd') . '-' . strtoupper(Str::random(5)),
                'asset_id' => $asset->id,
                'schedule_id' => $schedule->id,
                'type' => 'preventive',
                'priority' => $validated['priority'] ?? 'medium',
                'title' => $title,
                'description' => $validated['description'] ?? $schedule->notes,
                'status' => $initialStatus,
                'supervisor_id' => $validated['supervisor_id'] ?? $request->user()->id,
                'scheduled_start' => $schedule->next_due_at,
                'created_by' => $request->user()->id,
                'wo_source' => 'internal',
            ]);

            WorkOrderStatusLog::create([
                'wo_id' => $wo->id,
                'from_status' => null,
                'to_status' => $initialStatus,
                'changed_by' => $request->user()->id,
                'changed_at' => now(),
                'notes' => $approvalTemplate ? 'Dibuat dari jadwal maintenance - menunggu approval.' : 'Dibuat dari jadwal maintenance',
            ]);

            if (! $approvalTemplate && in_array($schedule->status, ['scheduled', 'overdue'], true)) {
                $schedule->update(['status' => 'due']);
            }

            if ($approvalTemplate) {
                $this->approvalWorkflowService->createApprovalRequest(
                    $approvalTemplate,
                    WorkOrder::class,
                    (int) $wo->id,
                    (int) $request->user()->id,
                    [
                        'code' => $wo->code,
                        'schedule_id' => $schedule->id,
                        'asset_id' => $asset->id,
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
                ? 'Work order dari jadwal dibuat dan menunggu approval.'
                : 'Work order dari jadwal berhasil dibuat.',
            'approval_required' => (bool) $approvalTemplate,
            'work_order' => $wo->load(['asset:id,name,code', 'supervisor:id,name']),
        ], 201);
    }
}
