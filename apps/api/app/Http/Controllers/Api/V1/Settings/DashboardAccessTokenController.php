<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

/**
 * @tags Settings - Dashboard Access Token
 */
class DashboardAccessTokenController extends Controller
{
    private function maskPin(string $pin): string
    {
        return substr($pin, 0, 2) . '****';
    }

    private function findAdminUser(): ?User
    {
        return User::query()
            ->where('is_active', true)
            ->whereHas('roles', function ($query) {
                $query->where('name', 'admin')->where('guard_name', 'web');
            })
            ->orderBy('id')
            ->first();
    }

    public function index(): JsonResponse
    {
        $current = DB::table('dashboard_access_tokens')
            ->leftJoin('users as dashboard_user', 'dashboard_user.id', '=', 'dashboard_access_tokens.user_id')
            ->leftJoin('users as generated_user', 'generated_user.id', '=', 'dashboard_access_tokens.generated_by')
            ->where('dashboard_access_tokens.is_active', true)
            ->orderByDesc('dashboard_access_tokens.id')
            ->select([
                'dashboard_access_tokens.id',
                'dashboard_access_tokens.masked_pin',
                'dashboard_access_tokens.expires_at',
                'dashboard_access_tokens.last_used_at',
                'dashboard_access_tokens.created_at',
                'dashboard_access_tokens.updated_at',
                'dashboard_user.id as dashboard_user_id',
                'dashboard_user.name as dashboard_user_name',
                'dashboard_user.email as dashboard_user_email',
                'generated_user.id as generated_by_id',
                'generated_user.name as generated_by_name',
            ])
            ->first();

        $history = DB::table('dashboard_access_token_histories')
            ->leftJoin('users as dashboard_user', 'dashboard_user.id', '=', 'dashboard_access_token_histories.user_id')
            ->leftJoin('users as generated_user', 'generated_user.id', '=', 'dashboard_access_token_histories.generated_by')
            ->orderByDesc('dashboard_access_token_histories.id')
            ->limit(20)
            ->select([
                'dashboard_access_token_histories.id',
                'dashboard_access_token_histories.masked_pin',
                'dashboard_access_token_histories.expires_at',
                'dashboard_access_token_histories.revoked_at',
                'dashboard_access_token_histories.created_at',
                'dashboard_user.id as dashboard_user_id',
                'dashboard_user.name as dashboard_user_name',
                'dashboard_user.email as dashboard_user_email',
                'generated_user.id as generated_by_id',
                'generated_user.name as generated_by_name',
            ])
            ->get();

        return response()->json([
            'data' => [
                'current' => $current,
                'history' => $history,
            ],
        ]);
    }

    public function rotate(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'expires_in_days' => 'required|integer|min:1|max:3650',
        ]);

        $adminUser = $this->findAdminUser();
        if (! $adminUser) {
            return response()->json([
                'code' => 'DASHBOARD_ADMIN_NOT_FOUND',
                'message' => 'User dengan role admin aktif tidak ditemukan.',
            ], 422);
        }

        $pin = str_pad((string) random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $masked = $this->maskPin($pin);
        $expiresAt = now()->addDays((int) $validated['expires_in_days']);
        $actorId = $request->user()?->id;

        DB::transaction(function () use ($adminUser, $pin, $masked, $expiresAt, $actorId) {
            DB::table('dashboard_access_tokens')
                ->where('is_active', true)
                ->update([
                    'is_active' => false,
                    'revoked_at' => now(),
                    'updated_at' => now(),
                ]);

            DB::table('dashboard_access_tokens')->insert([
                'user_id' => $adminUser->id,
                'token_hash' => Hash::make($pin),
                'masked_pin' => $masked,
                'expires_at' => $expiresAt,
                'is_active' => true,
                'generated_by' => $actorId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('dashboard_access_token_histories')->insert([
                'user_id' => $adminUser->id,
                'masked_pin' => $masked,
                'expires_at' => $expiresAt,
                'generated_by' => $actorId,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        });

        return response()->json([
            'message' => 'Token dashboard berhasil dibuat.',
            'data' => [
                'pin' => $pin,
                'masked_pin' => $masked,
                'expires_at' => $expiresAt->toISOString(),
                'dashboard_user' => [
                    'id' => $adminUser->id,
                    'name' => $adminUser->name,
                    'email' => $adminUser->email,
                ],
            ],
        ]);
    }
}

