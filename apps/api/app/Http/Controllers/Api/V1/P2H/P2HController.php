<?php

namespace App\Http\Controllers\Api\V1\P2H;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\P2hSubmission;
use App\Models\P2hTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * @tags P2H (Pre-Task Health Check)
 */
class P2HController extends Controller
{
    /**
     * Daftar checklist/template P2H (untuk manajemen).
     */
    public function checklists(Request $request): JsonResponse
    {
        $query = P2hTemplate::query()
            ->with('category:id,name')
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', filter_var($request->is_active, FILTER_VALIDATE_BOOLEAN)))
            ->orderByDesc('effective_from')
            ->orderByDesc('version')
            ->orderByDesc('id');

        return response()->json($query->paginate($request->per_page ?? 20));
    }

    /**
     * Buat checklist/template P2H baru.
     */
    public function storeChecklist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'applies_to_all_assets' => 'nullable|boolean',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'change_notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.group' => 'nullable|string|max:120',
            'items.*.item_name' => 'required|string|max:255',
            'items.*.type' => 'nullable|string|max:30',
            'is_active' => 'nullable|boolean',
        ]);

        $validated['applies_to_all_assets'] = (bool) ($validated['applies_to_all_assets'] ?? false);
        if (! $validated['applies_to_all_assets'] && empty($validated['asset_category_id'])) {
            return response()->json(['message' => 'asset_category_id wajib jika checklist tidak general.'], 422);
        }

        $latestVersion = P2hTemplate::query()
            ->where('name', $validated['name'])
            ->max('version') ?? 0;

        $template = P2hTemplate::create([
            ...$validated,
            'version' => $latestVersion + 1,
            'is_active' => $validated['is_active'] ?? true,
            'created_by' => $request->user()->id,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Checklist P2H berhasil dibuat.',
            'template' => $template->load('category'),
        ], 201);
    }

    /**
     * Update checklist/template P2H.
     */
    public function updateChecklist(Request $request, P2hTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'asset_category_id' => 'nullable|exists:asset_categories,id',
            'applies_to_all_assets' => 'nullable|boolean',
            'effective_from' => 'nullable|date',
            'effective_to' => 'nullable|date|after_or_equal:effective_from',
            'change_notes' => 'nullable|string',
            'items' => 'sometimes|array|min:1',
            'items.*.group' => 'nullable|string|max:120',
            'items.*.item_name' => 'required_with:items|string|max:255',
            'items.*.type' => 'nullable|string|max:30',
            'is_active' => 'nullable|boolean',
        ]);

        $candidate = array_merge($template->toArray(), $validated);
        $isGeneral = (bool) ($candidate['applies_to_all_assets'] ?? false);
        if (! $isGeneral && empty($candidate['asset_category_id'])) {
            return response()->json(['message' => 'asset_category_id wajib jika checklist tidak general.'], 422);
        }

        $template->update([
            ...$validated,
            'updated_by' => $request->user()->id,
        ]);

        return response()->json([
            'message' => 'Checklist P2H berhasil diperbarui.',
            'template' => $template->fresh()->load('category'),
        ]);
    }

    /**
     * Hapus checklist/template P2H.
     */
    public function destroyChecklist(P2hTemplate $template): JsonResponse
    {
        if ($template->submissions()->exists()) {
            $template->update(['is_active' => false]);
            return response()->json(['message' => 'Checklist sudah dipakai pada log, dinonaktifkan (soft disable).']);
        }

        $template->delete();
        return response()->json(['message' => 'Checklist P2H berhasil dihapus.']);
    }

    /**
     * Ambil template P2H berdasarkan aset
     */
    public function template(Asset $asset): JsonResponse
    {
        $today = now()->toDateString();
        $template = P2hTemplate::query()
            ->where('is_active', true)
            ->where(function ($q) use ($today) {
                $q->whereNull('effective_from')->orWhereDate('effective_from', '<=', $today);
            })
            ->where(function ($q) use ($today) {
                $q->whereNull('effective_to')->orWhereDate('effective_to', '>=', $today);
            })
            ->where(function ($q) use ($asset) {
                $q->where('applies_to_all_assets', true)
                    ->orWhere('asset_category_id', $asset->category_id);
            })
            ->orderByRaw('CASE WHEN asset_category_id = ? THEN 1 ELSE 0 END DESC', [$asset->category_id])
            ->orderByDesc('effective_from')
            ->orderByDesc('version')
            ->with('category')
            ->firstOrFail();

        return response()->json($template);
    }

    /**
     * Submit P2H baru
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id'    => 'required|exists:assets,id',
            'template_id' => 'required|exists:p2h_templates,id',
            'geolat'      => 'nullable|numeric',
            'geolng'      => 'nullable|numeric',
            'submission_date' => 'nullable|date',
            'items'       => 'required|array|min:1',
            'items.*.item_name'  => 'required|string',
            'items.*.group'      => 'nullable|string',
            'items.*.condition'  => 'required|in:ok,not_ok,na',
            'items.*.notes'      => 'nullable|string',
        ]);

        $submissionDate = $validated['submission_date'] ?? now()->toDateString();
        $exists = P2hSubmission::query()
            ->where('asset_id', $validated['asset_id'])
            ->where('operator_id', $request->user()->id)
            ->whereDate('submission_date', $submissionDate)
            ->exists();
        if ($exists) {
            return response()->json(['message' => 'P2H untuk aset ini pada tanggal tersebut sudah pernah disubmit oleh operator yang sama.'], 422);
        }

        $template = P2hTemplate::query()->findOrFail($validated['template_id']);

        $submission = P2hSubmission::create([
            'asset_id'     => $validated['asset_id'],
            'operator_id'  => $request->user()->id,
            'template_id'  => $validated['template_id'],
            'template_version' => $template->version ?? 1,
            'geolat'       => $validated['geolat'] ?? null,
            'geolng'       => $validated['geolng'] ?? null,
            'status'       => 'submitted',
            'submitted_at' => now(),
            'submission_date' => $submissionDate,
        ]);

        foreach ($validated['items'] as $item) {
            $submission->items()->create($item);
        }

        $supervisors = \App\Models\User::permission('review p2h')->get();
        foreach ($supervisors as $supervisor) {
            $notification = \App\Models\AppNotification::create([
                'user_id' => $supervisor->id,
                'type' => 'p2h_submission',
                'title' => 'Laporan P2H Baru',
                'body' => "Laporan P2H baru telah disubmit dan menunggu review.",
                'data' => [
                    'p2h_id' => $submission->id,
                    'asset_id' => $submission->asset_id,
                ],
                'is_read' => false,
            ]);

            if (class_exists(\App\Jobs\SendPushNotificationJob::class)) {
                \App\Jobs\SendPushNotificationJob::dispatch(
                    (int) $supervisor->id,
                    (int) $notification->id,
                    $notification->title,
                    $notification->body,
                    $notification->data
                );
            }
        }

        return response()->json([
            'message'    => 'P2H berhasil disubmit.',
            'submission' => $submission->load('items'),
        ], 201);
    }

    /**
     * Daftar P2H submission
     */
    public function index(Request $request): JsonResponse
    {
        $query = P2hSubmission::with(['asset:id,name,code', 'operator:id,name'])
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->when($request->asset_id, fn ($q) => $q->where('asset_id', $request->asset_id))
            ->when($request->date, fn ($q) => $q->whereDate('created_at', $request->date))
            ->when($request->from, fn ($q) => $q->whereDate('created_at', '>=', $request->from))
            ->when($request->to, fn ($q) => $q->whereDate('created_at', '<=', $request->to))
            ->when($request->q ?? $request->search, function ($q) use ($request) {
                $needle = trim((string) ($request->q ?? $request->search));
                $q->where(function ($grouped) use ($needle) {
                    $grouped->whereHas('asset', function ($sub) use ($needle) {
                        $sub->where('code', 'like', "%{$needle}%")
                            ->orWhere('name', 'like', "%{$needle}%");
                    })->orWhereHas('operator', function ($sub) use ($needle) {
                        $sub->where('name', 'like', "%{$needle}%");
                    });
                });
            })
            ->orderBy('created_at', 'desc');

        // Operators only see their own submissions
        if ($request->user()->hasRole('operator')) {
            $query->where('operator_id', $request->user()->id);
        }

        return response()->json($query->paginate($request->per_page ?? 15));
    }

    /**
     * Detail P2H submission
     */
    public function show(P2hSubmission $p2h): JsonResponse
    {
        $p2h->load(['asset', 'operator', 'template', 'reviewer', 'items']);

        return response()->json($p2h);
    }

    /**
     * Review P2H (supervisor)
     */
    public function review(Request $request, P2hSubmission $p2h): JsonResponse
    {
        $validated = $request->validate([
            'status'       => 'required|in:approved,rejected',
            'review_notes' => 'nullable|string',
        ]);

        $p2h->update([
            'status'       => $validated['status'],
            'reviewed_by'  => $request->user()->id,
            'review_notes' => $validated['review_notes'] ?? null,
            'reviewed_at'  => now(),
        ]);

        return response()->json(['message' => "P2H {$validated['status']}.", 'submission' => $p2h->fresh()]);
    }

    /**
     * Compliance rate P2H
     */
    public function compliance(Request $request): JsonResponse
    {
        $from = $request->from ?? now()->startOfMonth()->toDateString();
        $to   = $request->to ?? now()->toDateString();

        $total    = P2hSubmission::whereBetween('created_at', [$from, $to])->count();
        $approved = P2hSubmission::whereBetween('created_at', [$from, $to])->where('status', 'approved')->count();
        $rejected = P2hSubmission::whereBetween('created_at', [$from, $to])->where('status', 'rejected')->count();
        $pending  = P2hSubmission::whereBetween('created_at', [$from, $to])->where('status', 'submitted')->count();

        return response()->json([
            'period'           => ['from' => $from, 'to' => $to],
            'total'            => $total,
            'approved'         => $approved,
            'rejected'         => $rejected,
            'pending'          => $pending,
            'compliance_rate'  => $total > 0 ? round(($approved / $total) * 100, 2) : 0,
        ]);
    }

    /**
     * Sync P2H offline data
     */
    public function sync(Request $request, P2hSubmission $p2h): JsonResponse
    {
        // Used for mobile offline sync
        return response()->json(['message' => 'Sync berhasil.', 'submission' => $p2h]);
    }
}
