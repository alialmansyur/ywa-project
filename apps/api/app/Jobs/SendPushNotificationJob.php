<?php

namespace App\Jobs;

use App\Models\UserPushToken;
use App\Models\User;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendPushNotificationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 30;

    /**
     * @param array<string,mixed> $data
     */
    public function __construct(
        public int $userId,
        public int $notificationId,
        public string $title,
        public string $body,
        public array $data = [],
    ) {
    }

    public function handle(): void
    {
        $user = User::query()->find($this->userId);
        if (! $user) {
            return;
        }

        $baseUrl = (string) config('services.expo_push.base_url', 'https://exp.host/--/api/v2/push/send');
        $tokens = UserPushToken::query()
            ->where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('push_token')
            ->filter(fn ($token) => is_string($token) && trim($token) !== '')
            ->map(fn ($token) => trim($token))
            ->unique()
            ->values();

        // Backward compatibility: fallback ke users.fcm_token jika tabel baru belum terisi.
        if ($tokens->isEmpty() && is_string($user->fcm_token) && trim($user->fcm_token) !== '') {
            $tokens = collect([trim($user->fcm_token)]);
        }

        if ($tokens->isEmpty()) {
            return;
        }

        foreach ($tokens as $token) {
            $payload = [
                'to' => $token,
                'title' => $this->title,
                'body' => $this->body,
                'sound' => 'default',
                'data' => $this->data,
                'priority' => 'high',
            ];

            $response = Http::timeout(10)
                ->acceptJson()
                ->asJson()
                ->post($baseUrl, $payload);

            if ($response->failed()) {
                Log::warning('notification.push.failed', [
                    'user_id' => $this->userId,
                    'notification_id' => $this->notificationId,
                    'status' => $response->status(),
                    'token_tail' => substr($token, -8),
                    'response' => $response->body(),
                ]);

                continue;
            }

            UserPushToken::query()
                ->where('push_token', $token)
                ->update(['last_used_at' => now()]);
        }

        Log::info('notification.push.sent', [
            'user_id' => $this->userId,
            'notification_id' => $this->notificationId,
            'tokens_count' => $tokens->count(),
        ]);
    }
}
