<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MobileMenuPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $menuPermissionMap = [
            'mobile-home' => ['permission' => 'view mobile menu home', 'legacy' => 'view dashboard'],
            'mobile-workshop' => ['permission' => 'view mobile menu workshop', 'legacy' => 'view work-orders'],
            'mobile-work-orders' => ['permission' => 'view mobile menu work-orders', 'legacy' => 'view work-orders'],
            'mobile-report' => ['permission' => 'view mobile menu report', 'legacy' => 'create work-orders'],
            'mobile-findings' => ['permission' => 'view mobile menu findings', 'legacy' => 'view work-orders'],
            'mobile-p2h' => ['permission' => 'view mobile menu p2h', 'legacy' => 'view p2h'],
            'mobile-hm-tracking' => ['permission' => 'view mobile menu hm-tracking', 'legacy' => 'view assets'],
            'mobile-assets' => ['permission' => 'view mobile menu assets', 'legacy' => 'view assets'],
            'mobile-profile' => ['permission' => 'view mobile menu profile', 'legacy' => 'view dashboard'],
            'mobile-guide' => ['permission' => 'view mobile menu guide', 'legacy' => 'view dashboard'],
            'mobile-preventive' => ['permission' => 'view mobile menu preventive', 'legacy' => 'view assets'],
            'mobile-schedule' => ['permission' => 'view mobile menu schedule', 'legacy' => 'view schedules'],
            'mobile-inventory' => ['permission' => 'view mobile menu inventory', 'legacy' => 'view inventory'],
            'mobile-scan-qr' => ['permission' => 'view mobile menu scan-qr', 'legacy' => 'view assets'],
        ];

        foreach (['web', 'mobile'] as $guard) {
            foreach ($menuPermissionMap as $meta) {
                Permission::firstOrCreate([
                    'name' => $meta['permission'],
                    'guard_name' => $guard,
                ]);
            }
        }

        foreach (['web', 'mobile'] as $guard) {
            $roles = Role::query()->where('guard_name', $guard)->get();
            foreach ($roles as $role) {
                foreach ($menuPermissionMap as $meta) {
                    if ($role->hasPermissionTo($meta['legacy'])) {
                        $role->givePermissionTo($meta['permission']);
                    }
                }
            }
        }
    }
}

