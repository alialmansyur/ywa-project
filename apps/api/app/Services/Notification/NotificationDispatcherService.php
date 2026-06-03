<?php

namespace App\Services\Notification;

use App\Jobs\SendPushNotificationJob;
use App\Models\AppNotification;
use App\Models\User;
use App\Models\WorkOrder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;

class NotificationDispatcherService
{
    public static function buildRouteTargetPayload(
        array $data,
        array $targets,
        ?string $legacyRoute = null,
        ?string $legacyAdminRoute = null
    ): array {
        $normalizedTargets = [];

        foreach ($targets as $platform => $target) {
            if (! is_array($target)) {
                continue;
            }

            $route = trim((string) ($target['route'] ?? ''));
            $routeName = trim((string) ($target['route_name'] ?? ''));
            $params = is_array($target['params'] ?? null) ? $target['params'] : [];

            if ($route === '' && $routeName === '') {
                continue;
            }

            $normalizedTargets[$platform] = [
                'route_name' => $routeName !== '' ? $routeName : null,
                'route' => $route !== '' ? $route : null,
                'params' => $params,
            ];
        }

        if ($legacyRoute === null) {
            $legacyRoute = $normalizedTargets['mobile']['route']
                ?? $normalizedTargets['web']['route']
                ?? null;
        }

        if ($legacyAdminRoute === null) {
            $legacyAdminRoute = $normalizedTargets['admin']['route'] ?? null;
        }

        return array_merge($data, [
            'target' => (object) $normalizedTargets,
            'route' => $legacyRoute,
            'admin_route' => $legacyAdminRoute,
        ]);
    }

    public static function dispatchToAdmins(string $title, string $body, array $data = [], string $type = 'system'): void
    {
        self::dispatchToRoles(['admin', 'superadmin'], $title, $body, $data, $type);
    }

    public static function dispatchToUser(int $userId, string $title, string $body, array $data = [], string $type = 'system'): void
    {
        try {
            $target = User::query()->where('id', $userId)->where('is_active', true)->first(['id']);
            if (! $target) {
                return;
            }

            $notification = AppNotification::query()->create([
                'user_id' => $target->id,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'data' => $data,
                'is_read' => false,
            ]);

            SendPushNotificationJob::dispatch(
                (int) $target->id,
                (int) $notification->id,
                $title,
                $body,
                $data,
            );
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch user notification: ' . $e->getMessage());
        }
    }

    public static function dispatchToRoles(array $roles, string $title, string $body, array $data = [], string $type = 'system'): void
    {
        try {
            $targets = User::query()
                ->role($roles)
                ->where('is_active', true)
                ->get(['id']);

            foreach ($targets as $target) {
                $notification = AppNotification::query()->create([
                    'user_id' => $target->id,
                    'type' => $type,
                    'title' => $title,
                    'body' => $body,
                    'data' => $data,
                    'is_read' => false,
                ]);

                SendPushNotificationJob::dispatch(
                    (int) $target->id,
                    (int) $notification->id,
                    $title,
                    $body,
                    $data,
                );
            }
        } catch (\Throwable $e) {
            Log::warning('Failed to dispatch role notification: ' . $e->getMessage());
        }
    }

    /**
     * Dispatch in-app notification (and optional push) for work-order events.
     */
    public function dispatchWorkOrderEvent(WorkOrder $workOrder, string $eventKey, ?User $actor = null, array $meta = []): void
    {
        if (! $this->supportsEvent($eventKey)) {
            return;
        }

        [$title, $body] = $this->buildMessage($workOrder, $eventKey, $meta);
        $priority = $this->resolvePriority($eventKey);

        $payload = self::buildRouteTargetPayload([
            'event_key' => $eventKey,
            'entity_type' => 'work_order',
            'entity_id' => $workOrder->id,
            'work_order_id' => $workOrder->id,
            'work_order_code' => $workOrder->code,
            'priority' => $priority,
            'actor_id' => $actor?->id,
            'actor_name' => $actor?->name,
            'occurred_at' => now()->toISOString(),
            'meta' => $meta,
        ], [
            'mobile' => [
                'route_name' => 'workshop.detail',
                'route' => '/(tabs)/workshop/detail',
                'params' => ['work_order_id' => (string) $workOrder->id],
            ],
            'admin' => [
                'route_name' => 'work-orders.index',
                'route' => '/work-orders',
                'params' => ['work_order_id' => (string) $workOrder->id],
            ],
        ], '/workshop/detail?work_order_id=' . $workOrder->id, '/work-orders');

        $targets = $this->resolveTargets($workOrder, $eventKey, $actor);

        foreach ($targets as $target) {
            $notification = AppNotification::query()->create([
                'user_id' => $target->id,
                'type' => 'work_order_event',
                'title' => $title,
                'body' => $body,
                'data' => $payload,
                'is_read' => false,
            ]);

            if ($this->shouldPush($eventKey)) {
                SendPushNotificationJob::dispatch(
                    (int) $target->id,
                    (int) $notification->id,
                    $title,
                    $body,
                    $payload,
                );
            }
        }
    }

    /**
     * @return array{0:string,1:string}
     */
    private function buildMessage(WorkOrder $workOrder, string $eventKey, array $meta): array
    {
        $woCode = $workOrder->code ?? ('WO-' . $workOrder->id);
        $step = $meta['step_name'] ?? ('Step ' . ($meta['step_order'] ?? '-'));

        return match ($eventKey) {
            'PROCESS_STARTED' => [
                "Process Dimulai - {$woCode}",
                "Work order {$woCode} telah memasuki proses workshop.",
            ],
            'STEP_HOLD' => [
                "Step Hold - {$woCode}",
                "{$step} pada {$woCode} di-hold. Segera lakukan follow-up.",
            ],
            'STEP_REJECTED' => [
                "Step Ditolak - {$woCode}",
                "{$step} pada {$woCode} ditolak dan perlu tindak lanjut.",
            ],
            'STEP_APPROVED' => [
                "Step Disetujui - {$woCode}",
                "{$step} pada {$woCode} telah disetujui.",
            ],
            'PROCESS_COMPLETED' => [
                "Process Selesai - {$woCode}",
                "Work order {$woCode} telah selesai diproses.",
            ],
            default => [
                "Update Work Order - {$woCode}",
                "Terjadi event {$eventKey} pada work order {$woCode}.",
            ],
        };
    }

    private function resolvePriority(string $eventKey): string
    {
        return match ($eventKey) {
            'STEP_HOLD', 'STEP_REJECTED' => 'high',
            'PROCESS_STARTED', 'STEP_APPROVED' => 'medium',
            default => 'low',
        };
    }

    private function shouldPush(string $eventKey): bool
    {
        return in_array($eventKey, [
            'PROCESS_STARTED',
            'STEP_HOLD',
            'STEP_REJECTED',
            'STEP_APPROVED',
            'PROCESS_COMPLETED',
        ], true);
    }

    private function supportsEvent(string $eventKey): bool
    {
        return in_array($eventKey, [
            'PROCESS_STARTED',
            'STEP_HOLD',
            'STEP_REJECTED',
            'STEP_APPROVED',
            'PROCESS_COMPLETED',
        ], true);
    }

    /**
     * @return Collection<int, User>
     */
    private function resolveTargets(WorkOrder $workOrder, string $eventKey, ?User $actor): Collection
    {
        $targetIds = collect([
            $workOrder->created_by,
            $workOrder->supervisor_id,
            $workOrder->approved_by,
        ])->filter();

        $assigneeIds = $workOrder->assignees()->pluck('users.id');
        $targetIds = $targetIds->merge($assigneeIds);

        if (in_array($eventKey, ['STEP_HOLD', 'STEP_REJECTED'], true)) {
            $approverIds = User::permission('approve work-orders')->pluck('id');
            $targetIds = $targetIds->merge($approverIds);
        }

        if ($actor?->id) {
            $targetIds = $targetIds->reject(fn ($id) => (int) $id === (int) $actor->id);
        }

        $ids = $targetIds->map(fn ($id) => (int) $id)->unique()->values();
        if ($ids->isEmpty()) {
            return collect();
        }

        return User::query()
            ->whereIn('id', $ids)
            ->where('is_active', true)
            ->get(['id', 'name']);
    }
}
