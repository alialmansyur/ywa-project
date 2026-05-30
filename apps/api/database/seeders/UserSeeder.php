<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            'view dashboard',
            'view assets', 'create assets', 'edit assets', 'delete assets',
            'import assets', 'export assets',
            'view p2h', 'create p2h', 'review p2h',
            'view work-orders', 'create work-orders', 'edit work-orders',
            'delete work-orders', 'approve work-orders', 'assign work-orders', 'execute work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules', 'manage schedules',
            'view inventory', 'manage inventory',
            'view reports', 'export reports',
            'view reports p2h', 'view reports wo', 'view reports breakdown', 'view reports cost', 'view reports utilization', 'view reports mechanic',
            'view monitoring',
            'view users', 'manage users',
            'manage settings', 'manage smtp', 'manage system settings',
            'manage settings role-manager', 'manage settings approval-matrix', 'manage settings email-templates', 'manage settings notification-test', 'manage settings dashboard-access-token',
            'manage master data',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $supervisor = Role::firstOrCreate(['name' => 'supervisor']);
        $mechanic = Role::firstOrCreate(['name' => 'mechanic']);
        $operator = Role::firstOrCreate(['name' => 'operator']);
        $viewer = Role::firstOrCreate(['name' => 'viewer']);

        $superAdmin->syncPermissions(Permission::all());

        $admin->syncPermissions([
            'view dashboard',
            'view assets', 'create assets', 'edit assets', 'import assets', 'export assets',
            'view p2h', 'review p2h',
            'view work-orders', 'create work-orders', 'edit work-orders', 'approve work-orders', 'assign work-orders', 'execute work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules', 'manage schedules',
            'view inventory', 'manage inventory',
            'view reports', 'export reports',
            'view reports p2h', 'view reports wo', 'view reports breakdown', 'view reports cost', 'view reports utilization', 'view reports mechanic',
            'view monitoring',
            'view users', 'manage users',
            'manage settings', 'manage smtp', 'manage system settings',
            'manage settings role-manager', 'manage settings approval-matrix', 'manage settings email-templates', 'manage settings notification-test', 'manage settings dashboard-access-token',
        ]);

        $supervisor->syncPermissions([
            'view dashboard',
            'view assets', 'edit assets',
            'view p2h', 'review p2h',
            'view work-orders', 'create work-orders', 'edit work-orders', 'approve work-orders', 'assign work-orders', 'execute work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules',
            'view inventory',
            'view reports',
            'view monitoring',
        ]);

        $mechanic->syncPermissions([
            'view dashboard',
            'view assets',
            'view p2h',
            'view work-orders', 'edit work-orders', 'execute work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules',
            'view inventory',
        ]);

        $operator->syncPermissions([
            'view dashboard',
            'view assets',
            'view p2h', 'create p2h',
            'view work-orders', 'execute work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules',
        ]);

        $viewer->syncPermissions([
            'view dashboard',
            'view assets', 'view p2h', 'view work-orders',
            'view menu work-orders', 'view menu workshop-control-tower', 'view menu approvals', 'view menu approvals-inbox', 'view menu breakdown-reports', 'view menu findings',
            'view schedules',
            'view inventory', 'view reports',
            'view monitoring',
        ]);

        $users = [
            ['name' => 'Super Admin TAPG', 'email' => 'superadmin@tapg.local', 'phone' => '08100000001', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'super_admin'],
            ['name' => 'Admin TAPG', 'email' => 'admin@tapg.local', 'phone' => '08100000002', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'admin'],
            ['name' => 'Budi Supervisor', 'email' => 'supervisor@tapg.local', 'phone' => '08100000003', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'supervisor'],
            ['name' => 'Andi Mechanic', 'email' => 'mechanic@tapg.local', 'phone' => '08100000004', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'mechanic'],
            ['name' => 'Doni Operator', 'email' => 'operator@tapg.local', 'phone' => '08100000005', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'operator'],
            ['name' => 'Viewer TAPG', 'email' => 'viewer@tapg.local', 'phone' => '08100000006', 'password' => Hash::make('password'), 'is_active' => true, 'role' => 'viewer'],
        ];

        foreach ($users as $userData) {
            $role = $userData['role'];
            unset($userData['role']);
            $user = User::updateOrCreate(['email' => $userData['email']], $userData);
            $user->syncRoles([$role]);
        }

        $this->command->info('Users & Roles seeded successfully!');
    }
}
