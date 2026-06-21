<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    private string $permissionName = 'manage settings dashboard-settings';

    private string $menuKey = 'settings-dashboard-settings';

    public function up(): void
    {
        Permission::query()->firstOrCreate([
            'name' => $this->permissionName,
            'guard_name' => 'web',
        ]);

        foreach (['super_admin', 'admin'] as $roleName) {
            $role = Role::query()->where('name', $roleName)->where('guard_name', 'web')->first();
            if ($role) {
                $role->givePermissionTo($this->permissionName);
            }
        }

        DB::table('system_settings')->updateOrInsert(
            ['key' => 'dashboard.web.settings'],
            [
                'label' => 'Dashboard Web Settings',
                'type' => 'json',
                'scope' => 'module',
                'module_code' => 'dashboard',
                'value_text' => null,
                'value_json' => json_encode([
                    'headerTitle' => 'YWA Workshop Operations Dashboard',
                    'headerSubtitle' => 'Monitoring antrean, flow proses, dan preventive secara realtime.',
                    'sliderDurationSec' => 20,
                    'slide1ScrollSpeed' => 24,
                    'slide1ScrollDelaySec' => 1,
                    'slide1ScrollLoopPauseMs' => 1000,
                    'runningText' => 'ALERT: UNIT OVER SLA MENJADI PRIORITAS PENANGANAN|PERHATIAN: UNIT ON HOLD WAJIB DITINDAKLANJUTI DENGAN ETA|INFO: MONITOR STEP BOTTLENECK SECARA BERKALA|SCHEDULE: PREVENTIVE DUE TODAY HARUS DITUNTASKAN',
                    'slide1Title' => 'FIFO Workshop Board',
                    'slide1Desc' => 'Antrian unit aktif dari registrasi hingga serah terima (auto-hide saat selesai).',
                    'slide2Title' => 'Workshop Control Tower',
                    'slide2Desc' => 'Paritas layout control tower admin, mode view-only.',
                    'slide3Title' => 'Preventive & Operational KPI',
                    'slide3Desc' => 'Fokus due schedule, bottleneck, dan performa harian workshop.',
                    'slide4Title' => 'Dashboard Analyst',
                    'slide4Desc' => 'Trend 30 hari: WO, downtime, dan bottleneck.',
                ]),
                'validation_rules' => null,
                'is_secret' => false,
                'is_editable' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');
        if (! $settingsId) {
            return;
        }

        DB::table('app_menus')->updateOrInsert(
            ['menu_key' => $this->menuKey],
            [
                'parent_id' => $settingsId,
                'label' => 'Dashboard Settings',
                'route' => '/settings/dashboard-settings',
                'platform' => 'admin',
                'sort_order' => 10,
                'permission_prefix' => 'settings.dashboard-settings',
                'required_permission' => $this->permissionName,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $menuId = DB::table('app_menus')->where('menu_key', $this->menuKey)->value('id');
        if (! $menuId) {
            return;
        }

        DB::table('app_menu_services')->updateOrInsert(
            ['service_key' => 'settings.dashboard-settings.view'],
            [
                'menu_id' => $menuId,
                'label' => 'View Dashboard Settings',
                'http_method' => 'GET',
                'endpoint' => '/settings/dashboard-settings',
                'permission_name' => $this->permissionName,
                'sort_order' => 1,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('app_menu_services')->updateOrInsert(
            ['service_key' => 'settings.dashboard-settings.manage'],
            [
                'menu_id' => $menuId,
                'label' => 'Manage Dashboard Settings',
                'http_method' => 'PUT',
                'endpoint' => '/settings/dashboard-settings',
                'permission_name' => $this->permissionName,
                'sort_order' => 2,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('app_menu_services')->whereIn('service_key', [
            'settings.dashboard-settings.view',
            'settings.dashboard-settings.manage',
        ])->delete();

        DB::table('app_menus')->where('menu_key', $this->menuKey)->delete();
        DB::table('system_settings')->where('key', 'dashboard.web.settings')->delete();

        Permission::query()
            ->where('name', $this->permissionName)
            ->where('guard_name', 'web')
            ->delete();
    }
};
