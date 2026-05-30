<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

class NormalizeAdminMenuPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $menuPermissionMap = [
            'dashboard' => 'view dashboard',
            'assets' => 'view assets',
            'p2h' => 'view p2h',
            'work-orders' => 'view menu work-orders',
            'workshop-control-tower' => 'view menu workshop-control-tower',
            'approvals' => 'view menu approvals',
            'approvals-inbox' => 'view menu approvals-inbox',
            'approvals-requests' => 'manage settings approval-matrix',
            'breakdown-reports' => 'view menu breakdown-reports',
            'findings' => 'view menu findings',
            'schedule' => 'view schedules',
            'inventory' => 'view inventory',
            'reports' => 'view reports',
            'users' => 'view users',
            'monitoring' => 'view monitoring',
            'settings' => 'manage settings',
            'reports-wo-history' => 'view reports wo-history',
            'reports-workshop-step-control' => 'view reports workshop-step-control',
            'reports-service-history' => 'view reports service-history',
            'reports-downtime-analysis' => 'view reports downtime-analysis',
            'settings-role-manager' => 'manage settings role-manager',
            'settings-smtp' => 'manage smtp',
            'settings-system' => 'manage system settings',
            'settings-approval-matrix' => 'manage settings approval-matrix',
            'settings-email-templates' => 'manage settings email-templates',
            'settings-notification-test' => 'manage settings notification-test',
            'settings-master-data' => 'manage master data',
        ];

        foreach ($menuPermissionMap as $menuKey => $permissionName) {
            $permission = Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);

            DB::table('app_menus')
                ->where('menu_key', $menuKey)
                ->where('platform', 'admin')
                ->update([
                    'required_permission' => $permission->name,
                    'updated_at' => now(),
                ]);
        }

        $servicePermissionMap = [
            'assets.update' => 'edit assets',
            'work-orders.update' => 'edit work-orders',
            'findings.list' => 'view menu findings',
            'breakdown.list' => 'view menu breakdown-reports',
            'approvals.inbox' => 'view menu approvals-inbox',
        ];

        foreach ($servicePermissionMap as $serviceKey => $permissionName) {
            Permission::query()->firstOrCreate([
                'name' => $permissionName,
                'guard_name' => 'web',
            ]);

            DB::table('app_menu_services')
                ->where('service_key', $serviceKey)
                ->update([
                    'permission_name' => $permissionName,
                    'updated_at' => now(),
                ]);
        }
    }
}
