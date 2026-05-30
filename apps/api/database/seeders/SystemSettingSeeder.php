<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemSettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            ['key' => 'app.name', 'label' => 'Application Name', 'type' => 'string', 'scope' => 'global', 'module_code' => null, 'value_text' => 'TAPG Maintenance System'],
            ['key' => 'app.short_name', 'label' => 'Application Short Name', 'type' => 'string', 'scope' => 'global', 'module_code' => null, 'value_text' => 'TAPG'],
            ['key' => 'app.description', 'label' => 'Application Description', 'type' => 'string', 'scope' => 'global', 'module_code' => null, 'value_text' => 'Sistem maintenance aset, P2H, work order, inventory, dan monitoring workshop.'],
            ['key' => 'app.logo_url', 'label' => 'Application Logo URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => '/favicon.svg'],
            ['key' => 'app.favicon_url', 'label' => 'Favicon URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => '/favicon.svg'],
            ['key' => 'app.default_timezone', 'label' => 'Default Timezone', 'type' => 'string', 'scope' => 'global', 'module_code' => null, 'value_text' => 'Asia/Jakarta'],
            ['key' => 'app.default_locale', 'label' => 'Default Locale', 'type' => 'string', 'scope' => 'global', 'module_code' => null, 'value_text' => 'id-ID'],
            ['key' => 'url.api_base', 'label' => 'API Base URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => 'http://localhost:8000/api/v1'],
            ['key' => 'url.admin_base', 'label' => 'Admin Base URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => 'http://localhost:5173'],
            ['key' => 'url.dashboard_base', 'label' => 'Dashboard Base URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => 'http://localhost:5174'],
            ['key' => 'url.mobile_api_base', 'label' => 'Mobile API Base URL', 'type' => 'url', 'scope' => 'global', 'module_code' => null, 'value_text' => 'http://localhost:8000/api/v1'],
            ['key' => 'api.auth_token_ttl_days', 'label' => 'API Auth Token TTL (Days)', 'type' => 'number', 'scope' => 'module', 'module_code' => 'api', 'value_text' => '30'],
            ['key' => 'api.rate_limit_per_minute', 'label' => 'API Rate Limit per Minute', 'type' => 'number', 'scope' => 'module', 'module_code' => 'api', 'value_text' => '240'],
            ['key' => 'api.docs_url', 'label' => 'API Docs URL', 'type' => 'url', 'scope' => 'module', 'module_code' => 'api', 'value_text' => 'http://localhost:8000/docs/api'],
            ['key' => 'mobile.fcm_enabled', 'label' => 'Mobile FCM Enabled', 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'mobile', 'value_text' => 'true'],
            ['key' => 'mobile.min_supported_version', 'label' => 'Mobile Min Supported Version', 'type' => 'string', 'scope' => 'module', 'module_code' => 'mobile', 'value_text' => '1.0.0'],
            ['key' => 'mobile.force_update', 'label' => 'Mobile Force Update', 'type' => 'boolean', 'scope' => 'module', 'module_code' => 'mobile', 'value_text' => 'false'],
            ['key' => 'dashboard.header_title', 'label' => 'Dashboard Header Title', 'type' => 'string', 'scope' => 'module', 'module_code' => 'dashboard', 'value_text' => 'TAPG Workshop Live Dashboard'],
            ['key' => 'dashboard.header_subtitle', 'label' => 'Dashboard Header Subtitle', 'type' => 'string', 'scope' => 'module', 'module_code' => 'dashboard', 'value_text' => 'Asset Queue & Floor Monitoring'],
            ['key' => 'dashboard.slider_duration_sec', 'label' => 'Dashboard Slider Duration (Sec)', 'type' => 'number', 'scope' => 'module', 'module_code' => 'dashboard', 'value_text' => '20'],
            ['key' => 'dashboard.queue_toast_interval_sec', 'label' => 'Dashboard Queue Toast Interval (Sec)', 'type' => 'number', 'scope' => 'module', 'module_code' => 'dashboard', 'value_text' => '15'],
            ['key' => 'admin.theme_default', 'label' => 'Admin Default Theme', 'type' => 'select', 'scope' => 'module', 'module_code' => 'admin', 'value_json' => '"dark"'],
            ['key' => 'admin.search_placeholder', 'label' => 'Admin Topbar Search Placeholder', 'type' => 'string', 'scope' => 'module', 'module_code' => 'admin', 'value_text' => 'Cari aset, WO, P2H...'],
        ];

        foreach ($defaults as $item) {
            DB::table('system_settings')->updateOrInsert(
                ['key' => $item['key']],
                [
                    'label' => $item['label'],
                    'type' => $item['type'],
                    'scope' => $item['scope'],
                    'module_code' => $item['module_code'],
                    'value_text' => $item['value_text'] ?? null,
                    'value_json' => $item['value_json'] ?? null,
                    'validation_rules' => null,
                    'is_secret' => false,
                    'is_editable' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
