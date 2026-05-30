<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AppMenuServiceSeeder extends Seeder
{
    public function run(): void
    {
        $menusByKey = DB::table('app_menus')->pluck('id', 'menu_key');

        $services = [
            ['menu_key' => 'dashboard', 'service_key' => 'dashboard.overview', 'label' => 'Dashboard Overview', 'http_method' => 'GET', 'endpoint' => '/dashboard/overview', 'permission_name' => 'view dashboard', 'sort_order' => 1],
            ['menu_key' => 'assets', 'service_key' => 'assets.list', 'label' => 'List Assets', 'http_method' => 'GET', 'endpoint' => '/assets', 'permission_name' => 'view assets', 'sort_order' => 1],
            ['menu_key' => 'assets', 'service_key' => 'assets.create', 'label' => 'Create Asset', 'http_method' => 'POST', 'endpoint' => '/assets', 'permission_name' => 'create assets', 'sort_order' => 2],
            ['menu_key' => 'assets', 'service_key' => 'assets.update', 'label' => 'Update Asset', 'http_method' => 'PUT', 'endpoint' => '/assets/{asset}', 'permission_name' => 'edit assets', 'sort_order' => 3],
            ['menu_key' => 'assets', 'service_key' => 'assets.delete', 'label' => 'Delete Asset', 'http_method' => 'DELETE', 'endpoint' => '/assets/{asset}', 'permission_name' => 'delete assets', 'sort_order' => 4],
            ['menu_key' => 'assets', 'service_key' => 'assets.import', 'label' => 'Import Assets', 'http_method' => 'POST', 'endpoint' => '/assets/import', 'permission_name' => 'import assets', 'sort_order' => 5],
            ['menu_key' => 'assets', 'service_key' => 'assets.export', 'label' => 'Export Assets', 'http_method' => 'GET', 'endpoint' => '/assets/export', 'permission_name' => 'export assets', 'sort_order' => 6],
            ['menu_key' => 'p2h', 'service_key' => 'p2h.list', 'label' => 'List P2H', 'http_method' => 'GET', 'endpoint' => '/p2h', 'permission_name' => 'view p2h', 'sort_order' => 1],
            ['menu_key' => 'p2h', 'service_key' => 'p2h.create', 'label' => 'Create P2H', 'http_method' => 'POST', 'endpoint' => '/p2h', 'permission_name' => 'create p2h', 'sort_order' => 2],
            ['menu_key' => 'p2h', 'service_key' => 'p2h.review', 'label' => 'Review P2H', 'http_method' => 'PATCH', 'endpoint' => '/p2h/{p2h}/review', 'permission_name' => 'review p2h', 'sort_order' => 3],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.list', 'label' => 'List Work Orders', 'http_method' => 'GET', 'endpoint' => '/work-orders', 'permission_name' => 'view work-orders', 'sort_order' => 1],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.create', 'label' => 'Create Work Order', 'http_method' => 'POST', 'endpoint' => '/work-orders', 'permission_name' => 'create work-orders', 'sort_order' => 2],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.update', 'label' => 'Update Work Order', 'http_method' => 'PUT', 'endpoint' => '/work-orders/{workOrder}', 'permission_name' => 'edit work-orders', 'sort_order' => 3],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.delete', 'label' => 'Delete Work Order', 'http_method' => 'DELETE', 'endpoint' => '/work-orders/{workOrder}', 'permission_name' => 'delete work-orders', 'sort_order' => 4],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.approve', 'label' => 'Approve Work Order', 'http_method' => 'POST', 'endpoint' => '/work-orders/{workOrder}/approve', 'permission_name' => 'approve work-orders', 'sort_order' => 5],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.assign', 'label' => 'Assign Work Order', 'http_method' => 'POST', 'endpoint' => '/work-orders/{workOrder}/assign', 'permission_name' => 'assign work-orders', 'sort_order' => 6],
            ['menu_key' => 'work-orders', 'service_key' => 'work-orders.execute', 'label' => 'Execute Work Order Process', 'http_method' => 'POST', 'endpoint' => '/work-orders/{workOrder}/process/*', 'permission_name' => 'execute work-orders', 'sort_order' => 7],
            ['menu_key' => 'workshop-control-tower', 'service_key' => 'workshop-control-tower.overview', 'label' => 'Workshop Control Tower Overview', 'http_method' => 'GET', 'endpoint' => '/workshop-control-tower/overview', 'permission_name' => 'view work-orders', 'sort_order' => 1],
            ['menu_key' => 'schedule', 'service_key' => 'schedules.list', 'label' => 'List Schedules', 'http_method' => 'GET', 'endpoint' => '/schedules', 'permission_name' => 'view schedules', 'sort_order' => 1],
            ['menu_key' => 'schedule', 'service_key' => 'schedules.manage', 'label' => 'Manage Schedules', 'http_method' => 'POST', 'endpoint' => '/schedules', 'permission_name' => 'manage schedules', 'sort_order' => 2],
            ['menu_key' => 'inventory', 'service_key' => 'inventory.list', 'label' => 'List Inventory', 'http_method' => 'GET', 'endpoint' => '/inventory', 'permission_name' => 'view inventory', 'sort_order' => 1],
            ['menu_key' => 'inventory', 'service_key' => 'inventory.manage', 'label' => 'Manage Inventory', 'http_method' => 'POST', 'endpoint' => '/inventory/transactions', 'permission_name' => 'manage inventory', 'sort_order' => 2],
            ['menu_key' => 'reports', 'service_key' => 'reports.view', 'label' => 'View Reports', 'http_method' => 'POST', 'endpoint' => '/reports/*', 'permission_name' => 'view reports', 'sort_order' => 1],
            ['menu_key' => 'reports', 'service_key' => 'reports.export', 'label' => 'Export Reports', 'http_method' => 'POST', 'endpoint' => '/reports/*', 'permission_name' => 'export reports', 'sort_order' => 2],
            ['menu_key' => 'monitoring', 'service_key' => 'monitoring.view', 'label' => 'View Monitoring', 'http_method' => 'GET', 'endpoint' => '/monitoring', 'permission_name' => 'view monitoring', 'sort_order' => 1],
            ['menu_key' => 'users', 'service_key' => 'users.view', 'label' => 'View Users', 'http_method' => 'GET', 'endpoint' => '/users', 'permission_name' => 'view users', 'sort_order' => 1],
            ['menu_key' => 'users', 'service_key' => 'users.manage', 'label' => 'Manage Users', 'http_method' => 'POST', 'endpoint' => '/users', 'permission_name' => 'manage users', 'sort_order' => 2],
            ['menu_key' => 'settings-role-manager', 'service_key' => 'settings.role-manager.manage', 'label' => 'Manage Role Manager', 'http_method' => 'PUT', 'endpoint' => '/settings/roles/{role}', 'permission_name' => 'manage settings role-manager', 'sort_order' => 1],
            ['menu_key' => 'settings-smtp', 'service_key' => 'settings.smtp.manage', 'label' => 'Manage SMTP Configuration', 'http_method' => 'PUT', 'endpoint' => '/settings/smtp/{id}', 'permission_name' => 'manage smtp', 'sort_order' => 1],
            ['menu_key' => 'settings-system', 'service_key' => 'settings.system.manage', 'label' => 'Manage System Settings', 'http_method' => 'PUT', 'endpoint' => '/settings/system/{id}', 'permission_name' => 'manage system settings', 'sort_order' => 1],
            ['menu_key' => 'findings', 'service_key' => 'findings.list', 'label' => 'List Findings', 'http_method' => 'GET', 'endpoint' => '/findings', 'permission_name' => 'view work-orders', 'sort_order' => 1],
            ['menu_key' => 'breakdown-reports', 'service_key' => 'breakdown.list', 'label' => 'List Breakdown', 'http_method' => 'GET', 'endpoint' => '/breakdown-reports', 'permission_name' => 'view work-orders', 'sort_order' => 1],
            ['menu_key' => 'approvals-inbox', 'service_key' => 'approvals.inbox', 'label' => 'Approvals Inbox', 'http_method' => 'GET', 'endpoint' => '/approvals/inbox', 'permission_name' => 'view work-orders', 'sort_order' => 1],
            ['menu_key' => 'approvals-requests', 'service_key' => 'approvals.requests.list', 'label' => 'Approvals History', 'http_method' => 'GET', 'endpoint' => '/settings/approvals/requests', 'permission_name' => 'manage settings approval-matrix', 'sort_order' => 1],
            ['menu_key' => 'settings-approval-matrix', 'service_key' => 'settings.approval-matrix.manage', 'label' => 'Manage Approval Matrix', 'http_method' => 'GET', 'endpoint' => '/settings/approvals/templates', 'permission_name' => 'manage settings approval-matrix', 'sort_order' => 1],
            ['menu_key' => 'settings-email-templates', 'service_key' => 'settings.email-templates.manage', 'label' => 'Manage Email Templates', 'http_method' => 'GET', 'endpoint' => '/settings/email-templates', 'permission_name' => 'manage settings email-templates', 'sort_order' => 1],
            ['menu_key' => 'settings-notification-test', 'service_key' => 'settings.notification-test.manage', 'label' => 'Manage Notification Test', 'http_method' => 'GET', 'endpoint' => '/settings/notification-test', 'permission_name' => 'manage settings notification-test', 'sort_order' => 1],
            ['menu_key' => 'settings-master-data', 'service_key' => 'settings.master-data.manage', 'label' => 'Manage Master Data', 'http_method' => 'GET', 'endpoint' => '/settings/master-data', 'permission_name' => 'manage master data', 'sort_order' => 1],
            ['menu_key' => 'reports-p2h', 'service_key' => 'reports.p2h.view', 'label' => 'View P2H Compliance Report', 'http_method' => 'GET', 'endpoint' => '/reports/p2h', 'permission_name' => 'view reports p2h', 'sort_order' => 1],
            ['menu_key' => 'reports-wo', 'service_key' => 'reports.wo.view', 'label' => 'View Work Order Report', 'http_method' => 'GET', 'endpoint' => '/reports/wo', 'permission_name' => 'view reports wo', 'sort_order' => 1],
            ['menu_key' => 'reports-breakdown', 'service_key' => 'reports.breakdown.view', 'label' => 'View Breakdown Report', 'http_method' => 'GET', 'endpoint' => '/reports/breakdown', 'permission_name' => 'view reports breakdown', 'sort_order' => 1],
            ['menu_key' => 'reports-cost', 'service_key' => 'reports.cost.view', 'label' => 'View Maintenance Cost Report', 'http_method' => 'GET', 'endpoint' => '/reports/cost', 'permission_name' => 'view reports cost', 'sort_order' => 1],
            ['menu_key' => 'reports-utilization', 'service_key' => 'reports.utilization.view', 'label' => 'View Asset Utilization Report', 'http_method' => 'GET', 'endpoint' => '/reports/utilization', 'permission_name' => 'view reports utilization', 'sort_order' => 1],
            ['menu_key' => 'reports-mechanic', 'service_key' => 'reports.mechanic.view', 'label' => 'View Mechanic Performance Report', 'http_method' => 'GET', 'endpoint' => '/reports/mechanic', 'permission_name' => 'view reports mechanic', 'sort_order' => 1],
            ['menu_key' => 'reports-wo-history', 'service_key' => 'reports.wo-history.view', 'label' => 'View WO History Report', 'http_method' => 'GET', 'endpoint' => '/reports/wo-history', 'permission_name' => 'view reports wo-history', 'sort_order' => 1],
            ['menu_key' => 'reports-workshop-step-control', 'service_key' => 'reports.workshop-step-control.view', 'label' => 'View Workshop Step Control Report', 'http_method' => 'GET', 'endpoint' => '/reports/workshop-step-control', 'permission_name' => 'view reports workshop-step-control', 'sort_order' => 1],
            ['menu_key' => 'reports-service-history', 'service_key' => 'reports.service-history.view', 'label' => 'View Service History Report', 'http_method' => 'GET', 'endpoint' => '/reports/service-history', 'permission_name' => 'view reports service-history', 'sort_order' => 1],
            ['menu_key' => 'reports-downtime-analysis', 'service_key' => 'reports.downtime-analysis.view', 'label' => 'View Downtime Analysis Report', 'http_method' => 'GET', 'endpoint' => '/reports/downtime-analysis', 'permission_name' => 'view reports downtime-analysis', 'sort_order' => 1],
            ['menu_key' => 'mobile-home', 'service_key' => 'mobile.home.view', 'label' => 'View Mobile Home Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu home', 'sort_order' => 1],
            ['menu_key' => 'mobile-workshop', 'service_key' => 'mobile.workshop.view', 'label' => 'View Mobile Workshop Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu workshop', 'sort_order' => 1],
            ['menu_key' => 'mobile-work-orders', 'service_key' => 'mobile.work-orders.view', 'label' => 'View Mobile Work Orders Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu work-orders', 'sort_order' => 1],
            ['menu_key' => 'mobile-report', 'service_key' => 'mobile.report.view', 'label' => 'View Mobile Report Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu report', 'sort_order' => 1],
            ['menu_key' => 'mobile-findings', 'service_key' => 'mobile.findings.view', 'label' => 'View Mobile Findings Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu findings', 'sort_order' => 1],
            ['menu_key' => 'mobile-p2h', 'service_key' => 'mobile.p2h.view', 'label' => 'View Mobile P2H Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu p2h', 'sort_order' => 1],
            ['menu_key' => 'mobile-hm-tracking', 'service_key' => 'mobile.hm-tracking.view', 'label' => 'View Mobile HM Tracking Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu hm-tracking', 'sort_order' => 1],
            ['menu_key' => 'mobile-assets', 'service_key' => 'mobile.assets.view', 'label' => 'View Mobile Assets Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu assets', 'sort_order' => 1],
            ['menu_key' => 'mobile-profile', 'service_key' => 'mobile.profile.view', 'label' => 'View Mobile Profile Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu profile', 'sort_order' => 1],
            ['menu_key' => 'mobile-guide', 'service_key' => 'mobile.guide.view', 'label' => 'View Mobile Guide Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu guide', 'sort_order' => 1],
            ['menu_key' => 'mobile-preventive', 'service_key' => 'mobile.preventive.view', 'label' => 'View Mobile Preventive Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu preventive', 'sort_order' => 1],
            ['menu_key' => 'mobile-schedule', 'service_key' => 'mobile.schedule.view', 'label' => 'View Mobile Schedule Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu schedule', 'sort_order' => 1],
            ['menu_key' => 'mobile-inventory', 'service_key' => 'mobile.inventory.view', 'label' => 'View Mobile Inventory Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu inventory', 'sort_order' => 1],
            ['menu_key' => 'mobile-scan-qr', 'service_key' => 'mobile.scan-qr.view', 'label' => 'View Mobile Scan QR Menu', 'http_method' => 'GET', 'endpoint' => '/settings/menu-access?category=mobile', 'permission_name' => 'view mobile menu scan-qr', 'sort_order' => 1],
        ];

        foreach ($services as $service) {
            $menuId = $menusByKey[$service['menu_key']] ?? null;
            if (!$menuId) {
                continue;
            }

            DB::table('app_menu_services')->updateOrInsert(
                ['service_key' => $service['service_key']],
                [
                    'menu_id' => $menuId,
                    'label' => $service['label'],
                    'http_method' => $service['http_method'],
                    'endpoint' => $service['endpoint'],
                    'permission_name' => $service['permission_name'],
                    'sort_order' => $service['sort_order'],
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }
}
