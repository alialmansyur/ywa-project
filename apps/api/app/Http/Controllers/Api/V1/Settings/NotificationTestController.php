<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Http\Controllers\Controller;
use App\Jobs\SendPushNotificationJob;
use App\Models\AppNotification;
use App\Models\User;
use App\Models\UserPushToken;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationTestController extends Controller
{
    public function activeUsers(Request $request): JsonResponse
    {
        $q = trim((string) $request->query('q', ''));

        $users = User::query()
            ->where('is_active', true)
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($nested) use ($q) {
                    $nested->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            ->with('roles:id,name')
            ->orderBy('name')
            ->limit(100)
            ->get(['id', 'name', 'email', 'fcm_token']);

        $tokenRows = UserPushToken::query()
            ->whereIn('user_id', $users->pluck('id'))
            ->where('is_active', true)
            ->selectRaw('user_id, MAX(last_used_at) as last_used_at, COUNT(*) as token_count')
            ->groupBy('user_id')
            ->get()
            ->keyBy('user_id');

        $rows = $users->map(function (User $user) use ($tokenRows) {
            $tokenMeta = $tokenRows->get($user->id);
            $tokenCount = (int) ($tokenMeta->token_count ?? 0);
            $legacyToken = is_string($user->fcm_token) && trim($user->fcm_token) !== '' ? 1 : 0;

            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->roles->pluck('name')->values(),
                'has_active_push_token' => ($tokenCount + $legacyToken) > 0,
                'active_push_token_count' => $tokenCount + $legacyToken,
                'last_push_seen_at' => $tokenMeta?->last_used_at,
            ];
        })->values();

        return response()->json([
            'data' => $rows,
            'total' => $rows->count(),
        ]);
    }

    public function send(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'mode' => 'required|string|in:target,blast',
            'user_id' => 'nullable|integer|exists:users,id',
            'title' => 'required|string|max:120',
            'body' => 'required|string|max:1000',
            'route' => 'nullable|string|max:255',
            'priority' => 'nullable|string|in:low,medium,high',
            'send_push' => 'nullable|boolean',
        ]);

        $mode = $validated['mode'];
        $sendPush = array_key_exists('send_push', $validated) ? (bool) $validated['send_push'] : true;

        $users = collect();
        if ($mode === 'target') {
            $target = User::query()->where('id', $validated['user_id'] ?? 0)->where('is_active', true)->first();
            if (! $target) {
                return response()->json([
                    'message' => 'Target user tidak aktif atau tidak ditemukan.',
                ], 422);
            }

            $hasToken = UserPushToken::query()->where('user_id', $target->id)->where('is_active', true)->exists()
                || (is_string($target->fcm_token) && trim($target->fcm_token) !== '');

            if (! $hasToken) {
                return response()->json([
                    'message' => 'Target user aktif tetapi belum memiliki push token aktif.',
                ], 422);
            }

            $users = collect([$target]);
        }

        if ($mode === 'blast') {
            $users = User::query()->where('is_active', true)->get(['id', 'name', 'fcm_token']);
        }

        $payload = [
            'event_key' => 'MANUAL_TEST_NOTIFICATION',
            'route' => $validated['route'] ?? '/notifications',
            'priority' => $validated['priority'] ?? 'medium',
            'meta' => [
                'sent_by' => $request->user()->id,
                'sent_by_name' => $request->user()->name,
                'mode' => $mode,
            ],
            'occurred_at' => now()->toISOString(),
        ];

        $inAppCount = 0;
        $pushQueued = 0;

        foreach ($users as $user) {
            $notif = AppNotification::query()->create([
                'user_id' => $user->id,
                'type' => 'manual_test',
                'title' => $validated['title'],
                'body' => $validated['body'],
                'data' => $payload,
                'is_read' => false,
            ]);
            $inAppCount++;

            if ($sendPush) {
                SendPushNotificationJob::dispatch(
                    (int) $user->id,
                    (int) $notif->id,
                    (string) $validated['title'],
                    (string) $validated['body'],
                    $payload,
                );
                $pushQueued++;
            }
        }

        return response()->json([
            'message' => 'Notifikasi test berhasil diproses.',
            'mode' => $mode,
            'in_app_count' => $inAppCount,
            'push_queued_count' => $pushQueued,
        ]);
    }
}
