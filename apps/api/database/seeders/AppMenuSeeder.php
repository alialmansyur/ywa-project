<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppMenuSeeder extends Seeder
{
    public function run(): void
    {
        $menus = [
            ['menu_key' => 'dashboard', 'label' => 'Dashboard', 'route' => '/dashboard', 'platform' => 'admin', 'sort_order' => 10, 'permission_prefix' => 'dashboard', 'required_permission' => 'view dashboard'],
            ['menu_key' => 'p2h', 'label' => 'P2H / Checklist', 'route' => '/p2h', 'platform' => 'admin', 'sort_order' => 20, 'permission_prefix' => 'p2h', 'required_permission' => 'view p2h'],
            ['menu_key' => 'breakdown-reports', 'label' => 'Laporan Breakdown', 'route' => '/breakdown-reports', 'platform' => 'admin', 'sort_order' => 30, 'permission_prefix' => 'breakdown-reports', 'required_permission' => 'view menu breakdown-reports'],
            ['menu_key' => 'findings', 'label' => 'Temuan Inspeksi', 'route' => '/findings', 'platform' => 'admin', 'sort_order' => 40, 'permission_prefix' => 'findings', 'required_permission' => 'view menu findings'],
            ['menu_key' => 'work-orders', 'label' => 'Work Order', 'route' => '/work-orders', 'platform' => 'admin', 'sort_order' => 50, 'permission_prefix' => 'work-orders', 'required_permission' => 'view menu work-orders'],
            ['menu_key' => 'approvals', 'label' => 'Approvals', 'route' => '/approvals/inbox', 'platform' => 'admin', 'sort_order' => 60, 'permission_prefix' => 'approvals', 'required_permission' => 'view menu approvals'],
            ['menu_key' => 'workshop-control-tower', 'label' => 'Workshop Control Tower', 'route' => '/workshop-control-tower', 'platform' => 'admin', 'sort_order' => 70, 'permission_prefix' => 'work-orders', 'required_permission' => 'view menu workshop-control-tower'],
            ['menu_key' => 'schedule', 'label' => 'Jadwal Maintenance', 'route' => '/schedule', 'platform' => 'admin', 'sort_order' => 80, 'permission_prefix' => 'schedules', 'required_permission' => 'view schedules'],
            ['menu_key' => 'inventory', 'label' => 'Inventory / Parts', 'route' => '/inventory', 'platform' => 'admin', 'sort_order' => 90, 'permission_prefix' => 'inventory', 'required_permission' => 'view inventory'],
            ['menu_key' => 'assets', 'label' => 'Asset Management', 'route' => '/assets', 'platform' => 'admin', 'sort_order' => 100, 'permission_prefix' => 'assets', 'required_permission' => 'view assets'],
            ['menu_key' => 'monitoring', 'label' => 'Asset Monitoring', 'route' => '/monitoring', 'platform' => 'admin', 'sort_order' => 110, 'permission_prefix' => 'monitoring', 'required_permission' => 'view monitoring'],
            ['menu_key' => 'reports', 'label' => 'Laporan', 'route' => '/reports', 'platform' => 'admin', 'sort_order' => 120, 'permission_prefix' => 'reports', 'required_permission' => 'view reports'],
            ['menu_key' => 'users', 'label' => 'User Management', 'route' => '/users', 'platform' => 'admin', 'sort_order' => 130, 'permission_prefix' => 'users', 'required_permission' => 'view users'],
            ['menu_key' => 'settings', 'label' => 'Pengaturan', 'route' => '/settings/role-manager', 'platform' => 'admin', 'sort_order' => 140, 'permission_prefix' => 'settings', 'required_permission' => 'manage settings'],

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

        foreach ($menus as $menu) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => $menu['menu_key']],
                array_merge($menu, ['parent_id' => null, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');
        $children = [
            ['menu_key' => 'settings-role-manager', 'label' => 'Role Manager', 'route' => '/settings/role-manager', 'platform' => 'admin', 'sort_order' => 1, 'permission_prefix' => 'settings.role-manager', 'required_permission' => 'manage settings role-manager'],
            ['menu_key' => 'settings-smtp', 'label' => 'SMTP Configuration', 'route' => '/settings/smtp', 'platform' => 'admin', 'sort_order' => 2, 'permission_prefix' => 'settings.smtp', 'required_permission' => 'manage smtp'],
            ['menu_key' => 'settings-system', 'label' => 'System Setting', 'route' => '/settings/system', 'platform' => 'admin', 'sort_order' => 3, 'permission_prefix' => 'settings.system', 'required_permission' => 'manage system settings'],
            ['menu_key' => 'settings-approval-matrix', 'label' => 'Approval Matrix', 'route' => '/settings/approval-matrix', 'platform' => 'admin', 'sort_order' => 4, 'permission_prefix' => 'settings.approval-matrix', 'required_permission' => 'manage settings approval-matrix'],
            ['menu_key' => 'settings-email-templates', 'label' => 'Email Templates', 'route' => '/settings/email-templates', 'platform' => 'admin', 'sort_order' => 5, 'permission_prefix' => 'settings.email-templates', 'required_permission' => 'manage settings email-templates'],
            ['menu_key' => 'settings-notification-test', 'label' => 'Notification Test', 'route' => '/settings/notification-test', 'platform' => 'admin', 'sort_order' => 6, 'permission_prefix' => 'settings.notification-test', 'required_permission' => 'manage settings notification-test'],
            ['menu_key' => 'settings-master-data', 'label' => 'Master Data Manager', 'route' => '/settings/master-data', 'platform' => 'admin', 'sort_order' => 7, 'permission_prefix' => 'settings.master-data', 'required_permission' => 'manage master data'],
        ];

        foreach ($children as $child) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => $child['menu_key']],
                array_merge($child, ['parent_id' => $settingsId, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()])
            );
        }

        $approvalsId = DB::table('app_menus')->where('menu_key', 'approvals')->value('id');
        if ($approvalsId) {
            $approvalChildren = [
                ['menu_key' => 'approvals-inbox', 'label' => 'Inbox Approval', 'route' => '/approvals/inbox', 'platform' => 'admin', 'sort_order' => 1, 'permission_prefix' => 'approvals.inbox', 'required_permission' => 'view menu approvals-inbox'],
                ['menu_key' => 'approvals-requests', 'label' => 'Riwayat Approval', 'route' => '/approvals/requests', 'platform' => 'admin', 'sort_order' => 2, 'permission_prefix' => 'approvals.requests', 'required_permission' => 'manage settings'],
                ['menu_key' => 'breakdown-reports', 'label' => 'Laporan Breakdown', 'route' => '/breakdown-reports', 'platform' => 'admin', 'sort_order' => 3, 'permission_prefix' => 'breakdown-reports', 'required_permission' => 'view menu breakdown-reports'],
                ['menu_key' => 'findings', 'label' => 'Temuan Inspeksi', 'route' => '/findings', 'platform' => 'admin', 'sort_order' => 4, 'permission_prefix' => 'findings', 'required_permission' => 'view menu findings'],
            ];
            foreach ($approvalChildren as $child) {
                DB::table('app_menus')->updateOrInsert(
                    ['menu_key' => $child['menu_key']],
                    array_merge($child, ['parent_id' => $approvalsId, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        $reportsId = DB::table('app_menus')->where('menu_key', 'reports')->value('id');
        if ($reportsId) {
            $reportsChildren = [
                ['menu_key' => 'reports-p2h', 'label' => 'P2H Compliance', 'route' => '/reports/p2h', 'platform' => 'admin', 'sort_order' => 1, 'permission_prefix' => 'reports.p2h', 'required_permission' => 'view reports p2h'],
                ['menu_key' => 'reports-wo', 'label' => 'Work Order Report', 'route' => '/reports/wo', 'platform' => 'admin', 'sort_order' => 2, 'permission_prefix' => 'reports.wo', 'required_permission' => 'view reports wo'],
                ['menu_key' => 'reports-breakdown', 'label' => 'Breakdown Analysis', 'route' => '/reports/breakdown', 'platform' => 'admin', 'sort_order' => 3, 'permission_prefix' => 'reports.breakdown', 'required_permission' => 'view reports breakdown'],
                ['menu_key' => 'reports-cost', 'label' => 'Maintenance Cost', 'route' => '/reports/cost', 'platform' => 'admin', 'sort_order' => 4, 'permission_prefix' => 'reports.cost', 'required_permission' => 'view reports cost'],
                ['menu_key' => 'reports-utilization', 'label' => 'Asset Utilization', 'route' => '/reports/utilization', 'platform' => 'admin', 'sort_order' => 5, 'permission_prefix' => 'reports.utilization', 'required_permission' => 'view reports utilization'],
                ['menu_key' => 'reports-mechanic', 'label' => 'Mechanic Performance', 'route' => '/reports/mechanic', 'platform' => 'admin', 'sort_order' => 6, 'permission_prefix' => 'reports.mechanic', 'required_permission' => 'view reports mechanic'],
                ['menu_key' => 'reports-wo-history', 'label' => 'WO History', 'route' => '/reports/wo-history', 'platform' => 'admin', 'sort_order' => 7, 'permission_prefix' => 'reports.wo-history', 'required_permission' => 'view reports wo-history'],
                ['menu_key' => 'reports-workshop-step-control', 'label' => 'Workshop Step Control', 'route' => '/reports/workshop-step-control', 'platform' => 'admin', 'sort_order' => 8, 'permission_prefix' => 'reports.workshop-step-control', 'required_permission' => 'view reports workshop-step-control'],
                ['menu_key' => 'reports-service-history', 'label' => 'Service History', 'route' => '/reports/service-history', 'platform' => 'admin', 'sort_order' => 9, 'permission_prefix' => 'reports.service-history', 'required_permission' => 'view reports service-history'],
                ['menu_key' => 'reports-downtime-analysis', 'label' => 'Downtime Analysis', 'route' => '/reports/downtime-analysis', 'platform' => 'admin', 'sort_order' => 10, 'permission_prefix' => 'reports.downtime-analysis', 'required_permission' => 'view reports downtime-analysis'],
            ];
            foreach ($reportsChildren as $child) {
                DB::table('app_menus')->updateOrInsert(
                    ['menu_key' => $child['menu_key']],
                    array_merge($child, ['parent_id' => $reportsId, 'is_active' => true, 'created_at' => now(), 'updated_at' => now()])
                );
            }
        }

        // Clean up duplicates
        DB::table('app_menus')->where('menu_key', 'settings-email')->delete();
        DB::table('app_menus')->where('menu_key', 'settings-email-template')->delete();
        DB::table('app_menus')->where('menu_key', 'email-templates')->delete();
    }
}
