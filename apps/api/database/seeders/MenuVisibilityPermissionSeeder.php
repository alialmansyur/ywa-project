<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MenuVisibilityPermissionSeeder extends Seeder
{
    public function run(): void
    {
        $guard = 'web';

        $menuPermissions = [
            'work-orders' => 'view menu work-orders',
            'workshop-control-tower' => 'view menu workshop-control-tower',
            'approvals' => 'view menu approvals',
            'approvals-inbox' => 'view menu approvals-inbox',
            'breakdown-reports' => 'view menu breakdown-reports',
            'findings' => 'view menu findings',
        ];

        foreach ($menuPermissions as $menuKey => $permissionName) {
            Permission::firstOrCreate([
                'name' => $permissionName,
                'guard_name' => $guard,
            ]);

            DB::table('app_menus')
                ->where('menu_key', $menuKey)
                ->update([
                    'required_permission' => $permissionName,
                    'updated_at' => now(),
                ]);
        }

        $roles = Role::query()->where('guard_name', $guard)->get();
        foreach ($roles as $role) {
            if ($role->hasPermissionTo('view work-orders', $guard)) {
                $role->givePermissionTo(array_values($menuPermissions));
            }

            // Backward-compatible guard:
            // jika role diberi akses menu terkait WO namun permission inti endpoint hilang,
            // pulihkan view work-orders agar route/API ber-middleware permission tetap bisa diakses.
            $hasAnyWoMenuPermission = collect(array_values($menuPermissions))
                ->contains(fn ($permission) => $role->hasPermissionTo($permission, $guard));
            if ($hasAnyWoMenuPermission && !$role->hasPermissionTo('view work-orders', $guard)) {
                $role->givePermissionTo('view work-orders');
            }
        }
    }
}
