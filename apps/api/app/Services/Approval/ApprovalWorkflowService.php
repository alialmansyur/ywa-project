<?php

namespace App\Services\Approval;

use Illuminate\Support\Facades\DB;

class ApprovalWorkflowService
{
    public function resolveActiveTemplate(string $routeKey): ?object
    {
        $now = now();

        return DB::table('approval_templates')
            ->where('route_key', $routeKey)
            ->where('is_active', true)
            ->where(function ($q) use ($now) {
                $q->whereNull('effective_from')
                    ->orWhere('effective_from', '<=', $now);
            })
            ->where(function ($q) use ($now) {
                $q->whereNull('effective_until')
                    ->orWhere('effective_until', '>=', $now);
            })
            ->orderByDesc('id')
            ->first();
    }

    public function createApprovalRequest(
        object $template,
        string $referenceType,
        int $referenceId,
        ?int $submittedBy,
        array $snapshot = [],
        array $metadata = []
    ): int {
        return DB::transaction(function () use ($template, $referenceType, $referenceId, $submittedBy, $snapshot, $metadata) {
            $steps = DB::table('approval_template_steps')
                ->where('template_id', $template->id)
                ->where('is_active', true)
                ->orderBy('step_order')
                ->get();

            $requestId = DB::table('approval_requests')->insertGetId([
                'template_id' => $template->id,
                'reference_type' => $referenceType,
                'reference_id' => $referenceId,
                'route_key' => $template->route_key,
                'submitted_by' => $submittedBy,
                'status' => 'pending',
                'current_step_order' => $steps->first()->step_order ?? null,
                'required_approvals_total' => (int) ($template->min_approvals_total ?? 1),
                'approved_count' => 0,
                'rejected_count' => 0,
                'submitted_at' => now(),
                'finalized_at' => null,
                'snapshot_json' => !empty($snapshot) ? json_encode($snapshot) : null,
                'metadata_json' => !empty($metadata) ? json_encode($metadata) : null,
                'decision_notes' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            foreach ($steps as $idx => $step) {
                $users = DB::table('approval_template_step_users')
                    ->where('template_step_id', $step->id)
                    ->pluck('user_id')
                    ->values()
                    ->all();

                DB::table('approval_request_steps')->insert([
                    'approval_request_id' => $requestId,
                    'template_step_id' => $step->id,
                    'step_order' => $step->step_order,
                    'step_name' => $step->step_name,
                    'status' => $idx === 0 ? 'pending' : 'pending',
                    'min_approvals_required' => (int) ($step->min_approvals_required ?? 1),
                    'approved_count' => 0,
                    'rejected_count' => 0,
                    'started_at' => $idx === 0 ? now() : null,
                    'finalized_at' => null,
                    'approver_snapshot_json' => json_encode($users),
                    'decision_notes' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                if ($idx === 0) {
                    foreach ($users as $userId) {
                        $notification = \App\Models\AppNotification::create([
                            'user_id' => $userId,
                            'type' => 'approval_request',
                            'title' => 'Permintaan Approval Baru',
                            'body' => "Terdapat permintaan approval {$template->name} yang membutuhkan review Anda.",
                            'data' => [
                                'approval_request_id' => $requestId,
                                'route_key' => $template->route_key,
                                'reference_type' => $referenceType,
                                'reference_id' => $referenceId,
                            ],
                            'is_read' => false,
                        ]);

                        if (class_exists(\App\Jobs\SendPushNotificationJob::class)) {
                            \App\Jobs\SendPushNotificationJob::dispatch(
                                (int) $userId,
                                (int) $notification->id,
                                $notification->title,
                                $notification->body,
                                $notification->data
                            );
                        }
                    }
                }
            }

            return $requestId;
        });
    }
}
