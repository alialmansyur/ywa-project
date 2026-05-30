<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;

return new class extends Migration
{
    public function up(): void
    {
        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');
        if (! $settingsId) {
            return;
        }

        $permissionName = 'manage settings database-backup';

        Permission::query()->firstOrCreate([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);

        DB::table('app_menus')->updateOrInsert(
            ['menu_key' => 'settings-database-backup'],
            [
                'parent_id' => $settingsId,
                'label' => 'Database Backup',
                'route' => '/settings/database-backup',
                'platform' => 'admin',
                'sort_order' => 8,
                'permission_prefix' => 'settings.database-backup',
                'required_permission' => $permissionName,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $menuId = DB::table('app_menus')->where('menu_key', 'settings-database-backup')->value('id');
        if (! $menuId) {
            return;
        }

        DB::table('app_menu_services')->updateOrInsert(
            ['service_key' => 'settings.database-backup.manage'],
            [
                'menu_id' => $menuId,
                'label' => 'Manage Database Backup',
                'http_method' => 'POST',
                'endpoint' => '/settings/database-backups',
                'permission_name' => $permissionName,
                'sort_order' => 1,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('app_menu_services')->where('service_key', 'settings.database-backup.manage')->delete();
        DB::table('app_menus')->where('menu_key', 'settings-database-backup')->delete();

        Permission::query()
            ->where('name', 'manage settings database-backup')
            ->where('guard_name', 'web')
            ->delete();
    }
};
