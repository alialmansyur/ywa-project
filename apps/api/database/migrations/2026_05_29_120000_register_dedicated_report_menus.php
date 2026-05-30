<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $reportsId = DB::table('app_menus')->where('menu_key', 'reports')->value('id');
        if (! $reportsId) {
            return;
        }

        $menus = [
            ['menu_key' => 'reports-wo-history', 'label' => 'WO History', 'route' => '/reports/wo-history', 'sort_order' => 7, 'permission_prefix' => 'reports.wo-history', 'required_permission' => 'view reports wo-history'],
            ['menu_key' => 'reports-workshop-step-control', 'label' => 'Workshop Step Control', 'route' => '/reports/workshop-step-control', 'sort_order' => 8, 'permission_prefix' => 'reports.workshop-step-control', 'required_permission' => 'view reports workshop-step-control'],
            ['menu_key' => 'reports-service-history', 'label' => 'Service History', 'route' => '/reports/service-history', 'sort_order' => 9, 'permission_prefix' => 'reports.service-history', 'required_permission' => 'view reports service-history'],
            ['menu_key' => 'reports-downtime-analysis', 'label' => 'Downtime Analysis', 'route' => '/reports/downtime-analysis', 'sort_order' => 10, 'permission_prefix' => 'reports.downtime-analysis', 'required_permission' => 'view reports downtime-analysis'],
        ];

        foreach ($menus as $menu) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => $menu['menu_key']],
                [
                    'parent_id' => $reportsId,
                    'label' => $menu['label'],
                    'route' => $menu['route'],
                    'platform' => 'admin',
                    'sort_order' => $menu['sort_order'],
                    'permission_prefix' => $menu['permission_prefix'],
                    'required_permission' => $menu['required_permission'],
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $services = [
            ['menu_key' => 'reports-wo-history', 'service_key' => 'reports.wo-history.view', 'label' => 'View WO History Report', 'endpoint' => '/reports/wo-history', 'permission_name' => 'view reports wo-history'],
            ['menu_key' => 'reports-workshop-step-control', 'service_key' => 'reports.workshop-step-control.view', 'label' => 'View Workshop Step Control Report', 'endpoint' => '/reports/workshop-step-control', 'permission_name' => 'view reports workshop-step-control'],
            ['menu_key' => 'reports-service-history', 'service_key' => 'reports.service-history.view', 'label' => 'View Service History Report', 'endpoint' => '/reports/service-history', 'permission_name' => 'view reports service-history'],
            ['menu_key' => 'reports-downtime-analysis', 'service_key' => 'reports.downtime-analysis.view', 'label' => 'View Downtime Analysis Report', 'endpoint' => '/reports/downtime-analysis', 'permission_name' => 'view reports downtime-analysis'],
        ];

        foreach ($services as $service) {
            $menuId = DB::table('app_menus')->where('menu_key', $service['menu_key'])->value('id');
            if (! $menuId) {
                continue;
            }

            DB::table('app_menu_services')->updateOrInsert(
                ['service_key' => $service['service_key']],
                [
                    'menu_id' => $menuId,
                    'label' => $service['label'],
                    'http_method' => 'GET',
                    'endpoint' => $service['endpoint'],
                    'permission_name' => $service['permission_name'],
                    'sort_order' => 1,
                    'is_active' => true,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        $serviceKeys = [
            'reports.wo-history.view',
            'reports.workshop-step-control.view',
            'reports.service-history.view',
            'reports.downtime-analysis.view',
        ];

        DB::table('app_menu_services')->whereIn('service_key', $serviceKeys)->delete();

        DB::table('app_menus')->whereIn('menu_key', [
            'reports-wo-history',
            'reports-workshop-step-control',
            'reports-service-history',
            'reports-downtime-analysis',
        ])->delete();
    }
};
