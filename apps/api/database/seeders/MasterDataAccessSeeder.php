<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class MasterDataAccessSeeder extends Seeder
{
    public function run(): void
    {
        $permission = Permission::firstOrCreate([
            'name' => 'manage master data',
            'guard_name' => 'web',
        ]);

        $superAdmin = Role::query()->where('name', 'super_admin')->where('guard_name', 'web')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permission);
        }

        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');
        if ($settingsId) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => 'settings-master-data'],
                [
                    'label' => 'Master Data Manager',
                    'route' => '/settings/master-data',
                    'icon' => null,
                    'platform' => 'admin',
                    'sort_order' => 7,
                    'permission_prefix' => 'settings.master-data',
                    'required_permission' => 'manage master data',
                    'parent_id' => $settingsId,
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]
            );
        }
    }
}
