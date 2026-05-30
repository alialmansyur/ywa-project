<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class SemiRealOperationalDummySeeder extends Seeder
{
    public function run(): void
    {
        $now = now();

        $assetIds = DB::table('assets')->pluck('id')->all();
        $operatorIds = DB::table('users')
            ->whereIn('id', DB::table('model_has_roles')->where('role_id', 5)->pluck('model_id'))
            ->pluck('id')
            ->all();
        $mechanicIds = DB::table('users')
            ->whereIn('id', DB::table('model_has_roles')->where('role_id', 4)->pluck('model_id'))
            ->pluck('id')
            ->all();
        $workOrderIds = DB::table('work_orders')->pluck('id')->all();
        $templateIds = DB::table('p2h_templates')->pluck('id')->all();
        $partRows = DB::table('spare_parts')->select('id', 'unit_price')->get();

        if (empty($operatorIds)) {
            $operatorIds = DB::table('users')->pluck('id')->all();
        }

        if (empty($assetIds) || empty($operatorIds)) {
            $this->command?->warn('Dummy seeder skipped: assets/operators belum tersedia.');
            return;
        }

        if (DB::table('asset_assignments')->count() === 0) {
            foreach (array_slice($assetIds, 0, 10) as $i => $assetId) {
                $userId = $operatorIds[$i % count($operatorIds)];
                DB::table('asset_assignments')->insert([
                    'asset_id' => $assetId,
                    'user_id' => $userId,
                    'assigned_at' => $now->copy()->subDays(rand(1, 10)),
                    'released_at' => null,
                    'notes' => 'Penugasan unit harian untuk operator.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('asset_locations')->count() === 0) {
            foreach (array_slice($assetIds, 0, 40) as $assetId) {
                DB::table('asset_locations')->insert([
                    'asset_id' => $assetId,
                    'lat' => -0.95 + (rand(-150, 150) / 10000),
                    'lng' => 119.87 + (rand(-150, 150) / 10000),
                    'address' => 'Workshop Area ' . rand(1, 6) . ', Morowali',
                    'recorded_by' => $operatorIds[array_rand($operatorIds)],
                    'created_at' => $now->copy()->subHours(rand(1, 200)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('asset_preventive_settings')->count() === 0) {
            foreach (array_slice($assetIds, 0, 30) as $assetId) {
                DB::table('asset_preventive_settings')->insert([
                    'asset_id' => $assetId,
                    'trigger_type' => ['hm', 'km', 'calendar'][array_rand(['hm', 'km', 'calendar'])],
                    'alert_before_value' => rand(20, 80),
                    'escalation_target' => 'planner_supervisor',
                    'auto_create_work_order' => 1,
                    'notification_channels' => json_encode(['in_app', 'email']),
                    'notes' => 'Dummy preventive setting semi-real.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('asset_workshop_histories')->count() === 0) {
            foreach (array_slice($assetIds, 0, 20) as $assetId) {
                $dateIn = $now->copy()->subDays(rand(7, 40));
                DB::table('asset_workshop_histories')->insert([
                    'asset_id' => $assetId,
                    'reference_no' => 'WSH-' . strtoupper(Str::random(8)),
                    'category' => ['preventive', 'corrective', 'breakdown'][array_rand(['preventive', 'corrective', 'breakdown'])],
                    'date_in' => $dateIn->toDateString(),
                    'date_out' => $dateIn->copy()->addDays(rand(1, 4))->toDateString(),
                    'issue' => 'Inspeksi menemukan getaran tidak normal.',
                    'action_taken' => 'Pengecekan mounting, pengencangan baut, dan penggantian komponen minor.',
                    'cost' => rand(250000, 3500000),
                    'downtime_hours' => rand(2, 28),
                    'notes' => 'Dummy history.',
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('p2h_submissions')->count() === 0 && !empty($templateIds)) {
            $submissionIds = [];
            foreach (array_slice($assetIds, 0, 15) as $i => $assetId) {
                $submittedAt = $now->copy()->subDays(rand(1, 7))->setTime(rand(5, 8), rand(0, 50));
                $id = DB::table('p2h_submissions')->insertGetId([
                    'asset_id' => $assetId,
                    'operator_id' => $operatorIds[$i % count($operatorIds)],
                    'template_id' => $templateIds[$i % count($templateIds)],
                    'template_version' => 1,
                    'reviewed_by' => null,
                    'status' => ['submitted', 'approved'][array_rand(['submitted', 'approved'])],
                    'geolat' => -0.95 + (rand(-100, 100) / 10000),
                    'geolng' => 119.87 + (rand(-100, 100) / 10000),
                    'signature_url' => null,
                    'review_notes' => null,
                    'submitted_at' => $submittedAt,
                    'submission_date' => $submittedAt->toDateString(),
                    'reviewed_at' => null,
                    'created_at' => $submittedAt,
                    'updated_at' => $submittedAt,
                ]);
                $submissionIds[] = $id;
            }

            if (DB::table('p2h_items')->count() === 0) {
                foreach ($submissionIds as $submissionId) {
                    foreach ([
                        ['Engine', 'Cek level oli mesin'],
                        ['Hydraulic', 'Cek kebocoran hose'],
                        ['Safety', 'Cek fungsi horn dan lampu'],
                    ] as [$group, $itemName]) {
                        DB::table('p2h_items')->insert([
                            'submission_id' => $submissionId,
                            'group' => $group,
                            'item_name' => $itemName,
                            'condition' => ['ok', 'ok', 'not_ok'][array_rand(['ok', 'ok', 'not_ok'])],
                            'notes' => 'Pengecekan harian shift pagi.',
                            'photo_url' => null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ]);
                    }
                }
            }
        }

        if (DB::table('findings')->count() === 0) {
            foreach (array_slice($assetIds, 0, 12) as $i => $assetId) {
                DB::table('findings')->insert([
                    'code' => 'FND-' . date('Ymd') . '-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                    'asset_id' => $assetId,
                    'reporter_id' => $operatorIds[$i % count($operatorIds)],
                    'section' => ['Engine', 'Undercarriage', 'Electrical'][array_rand(['Engine', 'Undercarriage', 'Electrical'])],
                    'description' => 'Terdapat indikasi abnormal pada komponen saat inspeksi rutin.',
                    'status' => ['submitted', 'in_review', 'resolved'][array_rand(['submitted', 'in_review', 'resolved'])],
                    'photo_path' => null,
                    'resolution_notes' => null,
                    'resolved_at' => null,
                    'created_at' => $now->copy()->subDays(rand(1, 10)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('breakdown_reports')->count() === 0) {
            foreach (array_slice($assetIds, 0, 10) as $i => $assetId) {
                DB::table('breakdown_reports')->insert([
                    'report_no' => 'BDR-' . date('Ymd') . '-' . str_pad((string) ($i + 1), 4, '0', STR_PAD_LEFT),
                    'asset_id' => $assetId,
                    'reporter_id' => $operatorIds[$i % count($operatorIds)],
                    'location_label' => 'Pit Area ' . rand(1, 4),
                    'description' => 'Unit mengalami indikasi breakdown saat operasi.',
                    'status' => ['submitted', 'in_review', 'processed'][array_rand(['submitted', 'in_review', 'processed'])],
                    'work_order_id' => !empty($workOrderIds) ? $workOrderIds[array_rand($workOrderIds)] : null,
                    'created_at' => $now->copy()->subDays(rand(1, 7)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('notifications')->count() === 0) {
            $users = DB::table('users')->pluck('id')->all();
            foreach (array_slice($users, 0, 20) as $idx => $userId) {
                DB::table('notifications')->insert([
                    'user_id' => $userId,
                    'type' => 'system',
                    'title' => 'Pengingat Preventive Maintenance',
                    'body' => 'Ada jadwal preventive yang mendekati due date untuk unit Anda.',
                    'data' => json_encode(['source' => 'dummy-seeder']),
                    'is_read' => $idx % 3 === 0 ? 1 : 0,
                    'read_at' => $idx % 3 === 0 ? $now->copy()->subHours(rand(1, 24)) : null,
                    'created_at' => $now->copy()->subHours(rand(1, 120)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('inventory_transactions')->count() === 0 && $partRows->count() > 0) {
            $processorPool = !empty($mechanicIds) ? $mechanicIds : $operatorIds;
            foreach ($partRows as $part) {
                DB::table('inventory_transactions')->insert([
                    'part_id' => $part->id,
                    'type' => 'in',
                    'qty' => rand(10, 30),
                    'unit_price' => $part->unit_price ?? rand(25000, 200000),
                    'reference_type' => 'purchase',
                    'reference_id' => null,
                    'processed_by' => $processorPool[array_rand($processorPool)],
                    'notes' => 'Stock masuk untuk kebutuhan preventive.',
                    'created_at' => $now->copy()->subDays(rand(1, 30)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('work_order_comments')->count() === 0 && !empty($workOrderIds)) {
            foreach (array_slice($workOrderIds, 0, 6) as $woId) {
                DB::table('work_order_comments')->insert([
                    'wo_id' => $woId,
                    'user_id' => $operatorIds[array_rand($operatorIds)],
                    'message' => 'Update progres: unit menunggu approval tahap berikutnya.',
                    'created_at' => $now->copy()->subHours(rand(1, 72)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('wo_parts_usage')->count() === 0 && !empty($workOrderIds) && $partRows->count() > 0) {
            foreach (array_slice($workOrderIds, 0, 5) as $woId) {
                $part = $partRows->random();
                DB::table('wo_parts_usage')->insert([
                    'wo_id' => $woId,
                    'part_id' => $part->id,
                    'qty_requested' => 2,
                    'qty_used' => 1,
                    'unit_price' => $part->unit_price ?? 0,
                    'created_at' => $now->copy()->subDays(rand(1, 10)),
                    'updated_at' => $now,
                ]);
            }
        }

        if (DB::table('work_order_attachments')->count() === 0 && !empty($workOrderIds)) {
            foreach (array_slice($workOrderIds, 0, 5) as $woId) {
                DB::table('work_order_attachments')->insert([
                    'wo_id' => $woId,
                    'file_path' => 'dummy/attachments/wo-' . $woId . '-inspection.jpg',
                    'file_name' => 'wo-' . $woId . '-inspection.jpg',
                    'type' => 'photo',
                    'uploaded_by' => $operatorIds[array_rand($operatorIds)],
                    'created_at' => $now->copy()->subDays(rand(1, 10)),
                    'updated_at' => $now,
                ]);
            }
        }

        $settings = [
            // Global App Branding
            ['key' => 'app.name', 'label' => 'Application Name', 'value_text' => 'TAPG Maintenance', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.short_name', 'label' => 'Application Short Name', 'value_text' => 'TAPG', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.company_name', 'label' => 'Company Name', 'value_text' => 'PT TAPG', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.logo_url', 'label' => 'Application Logo URL', 'value_text' => '/storage/system-settings/logo-tapg.png', 'value_json' => null, 'type' => 'url', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.icon_url', 'label' => 'Application Icon URL', 'value_text' => '/storage/system-settings/icon-tapg.png', 'value_json' => null, 'type' => 'url', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.favicon_url', 'label' => 'Application Favicon URL', 'value_text' => '/storage/system-settings/favicon-tapg.ico', 'value_json' => null, 'type' => 'url', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.support_email', 'label' => 'Support Email', 'value_text' => 'support@tapg.local', 'value_json' => null, 'type' => 'email', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'app.support_phone', 'label' => 'Support Phone', 'value_text' => '+62-813-0000-0000', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'app', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Global Theme / Color
            ['key' => 'theme.primary_color', 'label' => 'Primary Color', 'value_text' => '#0052CC', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.secondary_color', 'label' => 'Secondary Color', 'value_text' => '#1F2937', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.accent_color', 'label' => 'Accent Color', 'value_text' => '#0EA5E9', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.success_color', 'label' => 'Success Color', 'value_text' => '#16A34A', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.warning_color', 'label' => 'Warning Color', 'value_text' => '#F59E0B', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.danger_color', 'label' => 'Danger Color', 'value_text' => '#DC2626', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.info_color', 'label' => 'Info Color', 'value_text' => '#2563EB', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'theme.background_color', 'label' => 'Background Color', 'value_text' => '#F8FAFC', 'value_json' => null, 'type' => 'string', 'scope' => 'global', 'module_code' => 'theme', 'validation_rules' => json_encode(['regex' => '^#([A-Fa-f0-9]{6})$']), 'is_secret' => 0, 'is_editable' => 1],

            // Dashboard Settings
            ['key' => 'dashboard.default_time_range_days', 'label' => 'Dashboard Default Time Range (Days)', 'value_text' => '30', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'dashboard', 'validation_rules' => json_encode(['min' => 1, 'max' => 365]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'dashboard.auto_refresh_seconds', 'label' => 'Dashboard Auto Refresh Seconds', 'value_text' => '60', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'dashboard', 'validation_rules' => json_encode(['min' => 10, 'max' => 600]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'dashboard.show_work_order_priority_chart', 'label' => 'Show Work Order Priority Chart', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'dashboard', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'dashboard.show_downtime_trend_chart', 'label' => 'Show Downtime Trend Chart', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'dashboard', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'dashboard.widgets_order', 'label' => 'Dashboard Widgets Order', 'value_text' => null, 'value_json' => json_encode(['overview', 'work_order_status', 'upcoming_schedules', 'recent_activities', 'asset_status']), 'type' => 'json', 'scope' => 'module', 'module_code' => 'dashboard', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Admin Settings
            ['key' => 'admin.pagination_default', 'label' => 'Admin Default Pagination Size', 'value_text' => '20', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'admin', 'validation_rules' => json_encode(['min' => 10, 'max' => 200]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'admin.allow_user_import', 'label' => 'Allow User Import', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'admin', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'admin.allow_asset_import', 'label' => 'Allow Asset Import', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'admin', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'admin.audit_log_retention_days', 'label' => 'Audit Log Retention Days', 'value_text' => '365', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'admin', 'validation_rules' => json_encode(['min' => 30, 'max' => 1825]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'admin.profile_required_fields', 'label' => 'Admin Profile Required Fields', 'value_text' => null, 'value_json' => json_encode(['name', 'email', 'phone']), 'type' => 'json', 'scope' => 'module', 'module_code' => 'admin', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Mobile Settings
            ['key' => 'mobile.min_supported_version', 'label' => 'Mobile Minimum Supported Version', 'value_text' => '1.0.0', 'value_json' => null, 'type' => 'string', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.latest_version', 'label' => 'Mobile Latest Version', 'value_text' => '1.0.0', 'value_json' => null, 'type' => 'string', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.force_update', 'label' => 'Force Mobile Update', 'value_text' => 'false', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.home_quick_menu', 'label' => 'Mobile Home Quick Menu', 'value_text' => null, 'value_json' => json_encode(['scan_qr', 'p2h', 'work_orders', 'breakdown_report']), 'type' => 'json', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.enable_offline_mode', 'label' => 'Enable Mobile Offline Mode', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.sync_interval_minutes', 'label' => 'Mobile Sync Interval Minutes', 'value_text' => '15', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => json_encode(['min' => 5, 'max' => 120]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'mobile.max_photo_upload_mb', 'label' => 'Mobile Max Photo Upload (MB)', 'value_text' => '5', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'mobile', 'validation_rules' => json_encode(['min' => 1, 'max' => 20]), 'is_secret' => 0, 'is_editable' => 1],

            // Notification Settings
            ['key' => 'notification.breakdown_email_enabled', 'label' => 'Breakdown Email Notification', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'notification', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'notification.breakdown_push_enabled', 'label' => 'Breakdown Push Notification', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'notification', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'notification.p2h_reminder_enabled', 'label' => 'P2H Reminder Enabled', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'notification', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'notification.default_channels', 'label' => 'Default Notification Channels', 'value_text' => null, 'value_json' => json_encode(['in_app', 'email']), 'type' => 'json', 'scope' => 'module', 'module_code' => 'notification', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Maintenance / Work Order Rules
            ['key' => 'maintenance.default_due_days', 'label' => 'Default Due Days', 'value_text' => '30', 'value_json' => null, 'type' => 'number', 'scope' => 'global', 'module_code' => 'maintenance', 'validation_rules' => json_encode(['min' => 1, 'max' => 180]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'maintenance.preventive_alert_before_days', 'label' => 'Preventive Alert Before Days', 'value_text' => '7', 'value_json' => null, 'type' => 'number', 'scope' => 'module', 'module_code' => 'maintenance', 'validation_rules' => json_encode(['min' => 1, 'max' => 30]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'maintenance.auto_create_work_order', 'label' => 'Auto Create Work Order', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'maintenance', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'work_order.default_priority', 'label' => 'Work Order Default Priority', 'value_text' => 'medium', 'value_json' => null, 'type' => 'select', 'scope' => 'module', 'module_code' => 'work_order', 'validation_rules' => json_encode(['options' => ['low', 'medium', 'high', 'critical']]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'work_order.approval_required', 'label' => 'Work Order Approval Required', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'work_order', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Security & Session
            ['key' => 'security.max_login_attempts_per_minute', 'label' => 'Max Login Attempts Per Minute', 'value_text' => '5', 'value_json' => null, 'type' => 'number', 'scope' => 'global', 'module_code' => 'security', 'validation_rules' => json_encode(['min' => 3, 'max' => 20]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'security.session_timeout_minutes', 'label' => 'Session Timeout Minutes', 'value_text' => '720', 'value_json' => null, 'type' => 'number', 'scope' => 'global', 'module_code' => 'security', 'validation_rules' => json_encode(['min' => 30, 'max' => 1440]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'security.password_min_length', 'label' => 'Password Minimum Length', 'value_text' => '8', 'value_json' => null, 'type' => 'number', 'scope' => 'global', 'module_code' => 'security', 'validation_rules' => json_encode(['min' => 6, 'max' => 32]), 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'security.require_strong_password', 'label' => 'Require Strong Password', 'value_text' => 'true', 'value_json' => null, 'type' => 'boolean', 'scope' => 'global', 'module_code' => 'security', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],

            // Integration
            ['key' => 'integration.whatsapp_enabled', 'label' => 'WhatsApp Integration Enabled', 'value_text' => 'false', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'integration', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'integration.whatsapp_api_url', 'label' => 'WhatsApp API URL', 'value_text' => '', 'value_json' => null, 'type' => 'url', 'scope' => 'module', 'module_code' => 'integration', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
            ['key' => 'integration.whatsapp_api_key', 'label' => 'WhatsApp API Key', 'value_text' => '', 'value_json' => null, 'type' => 'string', 'scope' => 'module', 'module_code' => 'integration', 'validation_rules' => null, 'is_secret' => 1, 'is_editable' => 1],
            ['key' => 'integration.telegram_enabled', 'label' => 'Telegram Integration Enabled', 'value_text' => 'false', 'value_json' => null, 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'integration', 'validation_rules' => null, 'is_secret' => 0, 'is_editable' => 1],
        ];

        foreach ($settings as $setting) {
            DB::table('system_settings')->updateOrInsert(
                ['key' => $setting['key']],
                [
                    'label' => $setting['label'],
                    'value_text' => $setting['value_text'],
                    'value_json' => $setting['value_json'],
                    'type' => $setting['type'],
                    'scope' => $setting['scope'],
                    'module_code' => $setting['module_code'],
                    'validation_rules' => $setting['validation_rules'],
                    'is_secret' => $setting['is_secret'],
                    'is_editable' => $setting['is_editable'],
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        $this->command?->info('Semi-real operational dummy data prepared.');
    }
}
