<?php

namespace App\Http\Controllers\Api\V1\Asset;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetAssignment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * @tags Asset Assignment
 */
class AssetAssignmentController extends Controller
{
    public function current(Request $request): JsonResponse
    {
        $assignment = AssetAssignment::query()
            ->with(['asset.category', 'asset.latestLocation', 'user:id,name,email'])
            ->where('user_id', $request->user()->id)
            ->whereNull('released_at')
            ->latest('assigned_at')
            ->first();

        return response()->json([
            'assignment' => $assignment,
        ]);
    }

    public function assign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'required|exists:assets,id',
            'user_id' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $result = DB::transaction(function () use ($validated, $request) {
            $targetUserId = (int) ($validated['user_id'] ?? $request->user()->id);
            $asset = Asset::query()->lockForUpdate()->findOrFail($validated['asset_id']);

            $existingOnAsset = AssetAssignment::query()
                ->with('user:id,name,email')
                ->where('asset_id', $asset->id)
                ->whereNull('released_at')
                ->lockForUpdate()
                ->first();

            if ($existingOnAsset && (int) $existingOnAsset->user_id !== $targetUserId) {
                throw ValidationException::withMessages([
                    'asset_id' => ['Aset sedang digunakan oleh ' . ($existingOnAsset->user?->name ?? 'user lain') . '.'],
                ]);
            }

            $currentUserAssignment = AssetAssignment::query()
                ->where('user_id', $targetUserId)
                ->whereNull('released_at')
                ->lockForUpdate()
                ->first();

            if ($currentUserAssignment && (int) $currentUserAssignment->asset_id !== (int) $asset->id) {
                $currentUserAssignment->update(['released_at' => now()]);
            }

            $assignment = $existingOnAsset;
            if (! $assignment) {
                $assignment = AssetAssignment::create([
                    'asset_id' => $asset->id,
                    'user_id' => $targetUserId,
                    'assigned_at' => now(),
                    'notes' => $validated['notes'] ?? null,
                ]);
            }

            return $assignment->fresh(['asset.category', 'asset.latestLocation', 'user:id,name,email']);
        });

        return response()->json([
            'message' => 'Aset berhasil di-assign.',
            'assignment' => $result,
        ]);
    }

    public function unassign(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'asset_id' => 'nullable|exists:assets,id',
            'user_id' => 'nullable|exists:users,id',
        ]);

        $assignment = AssetAssignment::query()
            ->when(
                ! empty($validated['asset_id']),
                fn ($query) => $query->where('asset_id', $validated['asset_id']),
                fn ($query) => $query->where('user_id', $validated['user_id'] ?? $request->user()->id)
            )
            ->whereNull('released_at')
            ->latest('assigned_at')
            ->first();

        if (! $assignment) {
            return response()->json([
                'message' => 'Tidak ada aset aktif untuk dilepas.',
            ]);
        }

        $assignment->update(['released_at' => now()]);

        return response()->json([
            'message' => 'Aset berhasil di-unassign.',
        ]);
    }
}
