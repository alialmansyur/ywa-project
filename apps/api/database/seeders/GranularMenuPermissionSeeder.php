<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class GranularMenuPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'manage settings role-manager',
            'manage settings approval-matrix',
            'manage settings email-templates',
            'manage settings notification-test',
            'view reports p2h',
            'view reports wo',
            'view reports breakdown',
            'view reports cost',
            'view reports utilization',
            'view reports mechanic',
            'view reports wo-history',
            'view reports workshop-step-control',
            'view reports service-history',
            'view reports downtime-analysis',
        ];

        foreach (['web', 'mobile'] as $guard) {
            foreach ($permissions as $name) {
                Permission::firstOrCreate(['name' => $name, 'guard_name' => $guard]);
            }
        }

        $admin = Role::query()->where('name', 'admin')->where('guard_name', 'web')->first();
        $superAdmin = Role::query()->where('name', 'super_admin')->where('guard_name', 'web')->first();

        if ($admin) {
            $admin->givePermissionTo($permissions);
        }

        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }
    }
}
