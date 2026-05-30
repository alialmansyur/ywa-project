<?php

namespace App\Http\Controllers\Api\V1\Inventory;

use App\Http\Controllers\Controller;
use App\Models\SparePart;
use App\Models\Inventory;
use App\Models\InventoryTransaction;
use App\Services\Approval\ApprovalWorkflowService;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

/**
 * @tags Inventory
 */
class InventoryController extends Controller
{
    public function __construct(private readonly ApprovalWorkflowService $approvalWorkflowService)
    {
    }

    /**
     * Daftar spare part
     */
    public function indexParts(Request $request): JsonResponse
    {
        $parts = SparePart::with(['inventory'])
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('code', 'like', "%{$request->search}%"))
            ->when($request->category, fn ($q) => $q->where('category', $request->category))
            ->when($request->low_stock, fn ($q) => $q->scopeLowStock())
            ->paginate($request->per_page ?? 15);

        return response()->json($parts);
    }

    /**
     * Buat spare part baru
     */
    public function storePart(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code'        => 'required|string|unique:spare_parts,code',
            'name'        => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'category'    => 'nullable|string|max:100',
            'brand'       => 'nullable|string|max:100',
            'part_number' => 'nullable|string',
            'min_stock'   => 'nullable|integer|min:0',
            'unit_price'  => 'nullable|numeric|min:0',
            'notes'       => 'nullable|string',
        ]);

        $part = SparePart::create($validated);

        // Create default inventory record
        Inventory::create([
            'part_id'       => $part->id,
            'location'      => 'gudang-utama',
            'qty_available' => 0,
        ]);

        return response()->json(['message' => 'Spare part dibuat.', 'part' => $part], 201);
    }

    /**
     * Detail spare part
     */
    public function showPart(SparePart $part): JsonResponse
    {
        return response()->json($part->load(['inventory']));
    }

    /**
     * Update spare part
     */
    public function updatePart(Request $request, SparePart $part): JsonResponse
    {
        $validated = $request->validate([
            'code'        => ['required', 'string', Rule::unique('spare_parts', 'code')->ignore($part->id)],
            'name'        => 'required|string|max:255',
            'unit'        => 'required|string|max:50',
            'category'    => 'nullable|string|max:100',
            'brand'       => 'nullable|string|max:100',
            'part_number' => 'nullable|string',
            'min_stock'   => 'nullable|integer|min:0',
            'unit_price'  => 'nullable|numeric|min:0',
            'notes'       => 'nullable|string',
            'is_active'   => 'required|boolean',
        ]);

        $part->update($validated);

        return response()->json([
            'message' => 'Spare part diperbarui.',
            'part' => $part->fresh()->load(['inventory']),
        ]);
    }

    /**
     * Toggle status aktif spare part
     */
    public function togglePartActive(SparePart $part): JsonResponse
    {
        $part->update(['is_active' => !$part->is_active]);

        return response()->json([
            'message' => $part->is_active ? 'Spare part berhasil diaktifkan.' : 'Spare part berhasil dinonaktifkan.',
            'part' => $part->fresh()->load(['inventory']),
        ]);
    }

    /**
     * Hapus spare part
     */
    public function destroyPart(SparePart $part): JsonResponse
    {
        $hasStock = $part->inventory()->where('qty_available', '>', 0)->exists();
        if ($hasStock) {
            return response()->json([
                'message' => 'Spare part tidak bisa dihapus karena stok masih tersedia.',
            ], 422);
        }

        if ($part->woUsages()->exists()) {
            return response()->json([
                'message' => 'Spare part tidak bisa dihapus karena sudah digunakan pada work order.',
            ], 422);
        }

        if ($part->transactions()->exists()) {
            return response()->json([
                'message' => 'Spare part tidak bisa dihapus karena memiliki riwayat transaksi.',
            ], 422);
        }

        $part->delete();

        return response()->json([
            'message' => 'Spare part berhasil dihapus.',
        ]);
    }

    /**
     * Daftar stok inventory
     */
    public function indexInventory(Request $request): JsonResponse
    {
        $inventory = Inventory::with(['sparePart'])
            ->when($request->location, fn ($q) => $q->where('location', $request->location))
            ->paginate($request->per_page ?? 15);

        return response()->json($inventory);
    }

    /**
     * Riwayat transaksi inventory
     */
    public function indexTransactions(Request $request): JsonResponse
    {
        $transactions = InventoryTransaction::with(['sparePart:id,code,name,unit', 'processor:id,name'])
            ->when($request->part_id, fn ($q) => $q->where('part_id', (int) $request->part_id))
            ->when($request->type, fn ($q) => $q->where('type', $request->type))
            ->when($request->date_from, fn ($q) => $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->date_to, fn ($q) => $q->whereDate('created_at', '<=', $request->date_to))
            ->latest()
            ->paginate($request->per_page ?? 15);

        return response()->json($transactions);
    }

    /**
     * Transaksi inventory (masuk / keluar / adjustment)
     */
    public function storeTransaction(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'part_id'        => 'required|exists:spare_parts,id',
            'type'           => 'required|in:in,out,adjustment,return',
            'qty'            => 'required|numeric|min:0.01',
            'unit_price'     => 'nullable|numeric|min:0',
            'reference_type' => 'nullable|string',
            'reference_id'   => 'nullable|integer',
            'notes'          => 'nullable|string',
            'location'       => 'nullable|string|max:100',
        ]);

        $approvalTemplate = $request->attributes->get('approval.template');
        $needsApproval = (bool) $approvalTemplate && in_array($validated['type'], ['out', 'adjustment'], true);

        [$transaction, $inventory] = DB::transaction(function () use ($validated, $request, $approvalTemplate, $needsApproval) {
            $approvalStatus = $needsApproval ? 'pending_approval' : 'not_required';

            $transaction = InventoryTransaction::create([
                ...$validated,
                'processed_by' => $request->user()->id,
                'approval_status' => $approvalStatus,
                'applied_at' => $needsApproval ? null : now(),
            ]);

            $inventory = Inventory::firstOrCreate(
                ['part_id' => $validated['part_id'], 'location' => $validated['location'] ?? 'gudang-utama'],
                ['qty_available' => 0]
            );

            if (! $needsApproval) {
                $isInTransaction = in_array($validated['type'], ['in', 'return'], true);
                $delta = $isInTransaction ? $validated['qty'] : -$validated['qty'];
                $nextStock = (float) $inventory->qty_available + (float) $delta;

                if (! $isInTransaction && $nextStock < 0) {
                    abort(response()->json([
                        'message' => 'Stok tidak mencukupi untuk transaksi keluar.',
                    ], 422));
                }

                $inventory->increment('qty_available', $delta);
            }

            if ($needsApproval) {
                $this->approvalWorkflowService->createApprovalRequest(
                    $approvalTemplate,
                    InventoryTransaction::class,
                    (int) $transaction->id,
                    (int) $request->user()->id,
                    [
                        'part_id' => $validated['part_id'],
                        'type' => $validated['type'],
                        'qty' => $validated['qty'],
                    ],
                    [
                        'route_key' => $request->attributes->get('approval.route_key'),
                    ]
                );
            }

            return [$transaction, $inventory];
        });

        return response()->json([
            'message'     => $needsApproval
                ? 'Transaksi dicatat dan menunggu approval sebelum memengaruhi stok.'
                : 'Transaksi berhasil.',
            'approval_required' => $needsApproval,
            'transaction' => $transaction,
            'stock_now'   => $inventory->fresh()->qty_available,
        ], 201);
    }
}
