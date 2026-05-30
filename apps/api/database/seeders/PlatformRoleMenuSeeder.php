<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PlatformRoleMenuSeeder extends Seeder
{
    public function run(): void
    {
        $this->syncMobilePermissionsAndRoles();
        $this->syncMenuPlatforms();
    }

    private function syncMobilePermissionsAndRoles(): void
    {
        $webPermissions = Permission::query()
            ->where('guard_name', 'web')
            ->pluck('name')
            ->values();

        foreach ($webPermissions as $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'mobile',
            ]);
        }

        $roleNames = Role::query()
            ->where('guard_name', 'web')
            ->pluck('name')
            ->values();

        foreach ($roleNames as $roleName) {
            $webRole = Role::query()->where('name', $roleName)->where('guard_name', 'web')->first();
            $mobileRole = Role::firstOrCreate([
                'name' => $roleName,
                'guard_name' => 'mobile',
            ]);

            if ($webRole) {
                $mobilePermissionNames = $webRole->permissions->pluck('name')->values();
                $mobileRole->syncPermissions($mobilePermissionNames);
            }
        }
    }

    private function syncMenuPlatforms(): void
    {
        $mobileMenus = [
            ['menu_key' => 'mobile-home', 'label' => 'Beranda Mobile', 'route' => '/(tabs)', 'platform' => 'mobile', 'sort_order' => 10, 'permission_prefix' => 'mobile.menu.home', 'required_permission' => 'view mobile menu home'],
            ['menu_key' => 'mobile-workshop', 'label' => 'Workshop', 'route' => '/(tabs)/workshop', 'platform' => 'mobile', 'sort_order' => 20, 'permission_prefix' => 'mobile.menu.workshop', 'required_permission' => 'view mobile menu workshop'],
            ['menu_key' => 'mobile-work-orders', 'label' => 'Work Orders', 'route' => '/(tabs)/work-orders', 'platform' => 'mobile', 'sort_order' => 30, 'permission_prefix' => 'mobile.menu.work-orders', 'required_permission' => 'view mobile menu work-orders'],
            ['menu_key' => 'mobile-report', 'label' => 'Lapor Breakdown', 'route' => '/(tabs)/report', 'platform' => 'mobile', 'sort_order' => 40, 'permission_prefix' => 'mobile.menu.report', 'required_permission' => 'view mobile menu report'],
            ['menu_key' => 'mobile-findings', 'label' => 'Temuan', 'route' => '/(tabs)/findings', 'platform' => 'mobile', 'sort_order' => 50, 'permission_prefix' => 'mobile.menu.findings', 'required_permission' => 'view mobile menu findings'],
            ['menu_key' => 'mobile-p2h', 'label' => 'Form P2H', 'route' => '/(tabs)/p2h', 'platform' => 'mobile', 'sort_order' => 60, 'permission_prefix' => 'mobile.menu.p2h', 'required_permission' => 'view mobile menu p2h'],
            ['menu_key' => 'mobile-hm-tracking', 'label' => 'HM Tracking', 'route' => '/(tabs)/hm-tracking', 'platform' => 'mobile', 'sort_order' => 70, 'permission_prefix' => 'mobile.menu.hm-tracking', 'required_permission' => 'view mobile menu hm-tracking'],
            ['menu_key' => 'mobile-assets', 'label' => 'Aset Unit', 'route' => '/(tabs)/assets', 'platform' => 'mobile', 'sort_order' => 80, 'permission_prefix' => 'mobile.menu.assets', 'required_permission' => 'view mobile menu assets'],
            ['menu_key' => 'mobile-profile', 'label' => 'Profil', 'route' => '/(tabs)/profile', 'platform' => 'mobile', 'sort_order' => 90, 'permission_prefix' => 'mobile.menu.profile', 'required_permission' => 'view mobile menu profile'],
            ['menu_key' => 'mobile-guide', 'label' => 'Panduan', 'route' => '/(tabs)/guide', 'platform' => 'mobile', 'sort_order' => 100, 'permission_prefix' => 'mobile.menu.guide', 'required_permission' => 'view mobile menu guide'],
            ['menu_key' => 'mobile-preventive', 'label' => 'Preventive', 'route' => '/(tabs)/preventive', 'platform' => 'mobile', 'sort_order' => 110, 'permission_prefix' => 'mobile.menu.preventive', 'required_permission' => 'view mobile menu preventive'],
            ['menu_key' => 'mobile-schedule', 'label' => 'Jadwal', 'route' => '/(tabs)/schedule', 'platform' => 'mobile', 'sort_order' => 120, 'permission_prefix' => 'mobile.menu.schedule', 'required_permission' => 'view mobile menu schedule'],
            ['menu_key' => 'mobile-inventory', 'label' => 'Inventory', 'route' => '/(tabs)/inventory', 'platform' => 'mobile', 'sort_order' => 130, 'permission_prefix' => 'mobile.menu.inventory', 'required_permission' => 'view mobile menu inventory'],
            ['menu_key' => 'mobile-scan-qr', 'label' => 'Scan QR', 'route' => '/scanner', 'platform' => 'mobile', 'sort_order' => 140, 'permission_prefix' => 'mobile.menu.scan-qr', 'required_permission' => 'view mobile menu scan-qr'],
        ];

        foreach ($mobileMenus as $menu) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => $menu['menu_key']],
                array_merge($menu, [
                    'parent_id' => null,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]),
            );
        }

        $platformByMenuKey = [
            'dashboard' => 'admin',
            'p2h' => 'admin',
            'breakdown-reports' => 'admin',
            'findings' => 'admin',
            'work-orders' => 'admin',
            'approvals' => 'admin',
            'workshop-control-tower' => 'admin',
            'schedule' => 'admin',
            'inventory' => 'admin',
            'assets' => 'admin',
            'monitoring' => 'admin',
            'reports' => 'admin',
            'users' => 'admin',
            'settings' => 'admin',
            'settings-role-manager' => 'admin',
            'settings-smtp' => 'admin',
            'settings-system' => 'admin',
            'settings-approval-matrix' => 'admin',
            'settings-email-templates' => 'admin',
            'settings-notification-test' => 'admin',
            'approvals-inbox' => 'admin',
            'approvals-requests' => 'admin',
            'reports-p2h' => 'admin',
            'reports-wo' => 'admin',
            'reports-breakdown' => 'admin',
            'reports-cost' => 'admin',
            'reports-utilization' => 'admin',
            'reports-mechanic' => 'admin',
            'reports-wo-history' => 'admin',
            'reports-workshop-step-control' => 'admin',
            'reports-service-history' => 'admin',
            'reports-downtime-analysis' => 'admin',
            'email-templates' => 'admin',

            'mobile-home' => 'mobile',
            'mobile-workshop' => 'mobile',
            'mobile-work-orders' => 'mobile',
            'mobile-report' => 'mobile',
            'mobile-findings' => 'mobile',
            'mobile-p2h' => 'mobile',
            'mobile-hm-tracking' => 'mobile',
            'mobile-assets' => 'mobile',
            'mobile-profile' => 'mobile',
            'mobile-guide' => 'mobile',
            'mobile-preventive' => 'mobile',
            'mobile-schedule' => 'mobile',
            'mobile-inventory' => 'mobile',
            'mobile-scan-qr' => 'mobile',
        ];

        foreach ($platformByMenuKey as $menuKey => $platform) {
            DB::table('app_menus')
                ->where('menu_key', $menuKey)
                ->update([
                    'platform' => $platform,
                    'updated_at' => now(),
                ]);
        }
    }
}
