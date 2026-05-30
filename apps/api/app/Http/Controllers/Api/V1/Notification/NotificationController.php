<?php

namespace App\Http\Controllers\Api\V1\Notification;

use App\Http\Controllers\Controller;
use App\Models\AppNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

/**
 * @tags Notifications
 */
class NotificationController extends Controller
{
    /**
     * Daftar notifikasi user
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = AppNotification::where('user_id', $request->user()->id)
            ->when($request->unread_only, fn ($q) => $q->where('is_read', false))
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 20);

        $unreadCount = AppNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'unread_count'  => $unreadCount,
            'notifications' => $notifications,
        ]);
    }

    /**
     * Tandai notifikasi sebagai sudah dibaca
     */
    public function markRead(Request $request, AppNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this notification.');
        }

        $notification->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Notifikasi ditandai sebagai dibaca.']);
    }

    /**
     * Tandai semua notifikasi sebagai sudah dibaca
     */
    public function markAllRead(Request $request): JsonResponse
    {
        AppNotification::where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'read_at' => now()]);

        return response()->json(['message' => 'Semua notifikasi ditandai sebagai dibaca.']);
    }

    /**
     * Hapus notifikasi milik user
     */
    public function destroy(Request $request, AppNotification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            abort(403, 'Unauthorized access to this notification.');
        }
        $notification->delete();

        return response()->json(['message' => 'Notifikasi dihapus.']);
    }
}
