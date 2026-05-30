<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dashboard_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('token_hash', 255);
            $table->string('masked_pin', 10);
            $table->timestamp('expires_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        Schema::create('dashboard_access_token_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('masked_pin', 10);
            $table->timestamp('expires_at')->nullable();
            $table->foreignId('generated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();
        });

        $permissionName = 'manage settings dashboard-access-token';

        Permission::query()->firstOrCreate([
            'name' => $permissionName,
            'guard_name' => 'web',
        ]);

        $superAdmin = Role::query()->where('name', 'super_admin')->where('guard_name', 'web')->first();
        $admin = Role::query()->where('name', 'admin')->where('guard_name', 'web')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissionName);
        }
        if ($admin) {
            $admin->givePermissionTo($permissionName);
        }

        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');
        if (! $settingsId) {
            return;
        }

        DB::table('app_menus')->updateOrInsert(
            ['menu_key' => 'settings-dashboard-access-token'],
            [
                'parent_id' => $settingsId,
                'label' => 'Token Akses Dashboard',
                'route' => '/settings/dashboard-access-token',
                'platform' => 'admin',
                'sort_order' => 9,
                'permission_prefix' => 'settings.dashboard-access-token',
                'required_permission' => $permissionName,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $menuId = DB::table('app_menus')->where('menu_key', 'settings-dashboard-access-token')->value('id');
        if (! $menuId) {
            return;
        }

        DB::table('app_menu_services')->updateOrInsert(
            ['service_key' => 'settings.dashboard-access-token.view'],
            [
                'menu_id' => $menuId,
                'label' => 'View Dashboard Access Token',
                'http_method' => 'GET',
                'endpoint' => '/settings/dashboard-access-token',
                'permission_name' => $permissionName,
                'sort_order' => 1,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        DB::table('app_menu_services')->updateOrInsert(
            ['service_key' => 'settings.dashboard-access-token.rotate'],
            [
                'menu_id' => $menuId,
                'label' => 'Rotate Dashboard Access Token',
                'http_method' => 'POST',
                'endpoint' => '/settings/dashboard-access-token/rotate',
                'permission_name' => $permissionName,
                'sort_order' => 2,
                'is_active' => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
    }

    public function down(): void
    {
        DB::table('app_menu_services')->whereIn('service_key', [
            'settings.dashboard-access-token.view',
            'settings.dashboard-access-token.rotate',
        ])->delete();
        DB::table('app_menus')->where('menu_key', 'settings-dashboard-access-token')->delete();

        Permission::query()
            ->where('name', 'manage settings dashboard-access-token')
            ->where('guard_name', 'web')
            ->delete();

        Schema::dropIfExists('dashboard_access_token_histories');
        Schema::dropIfExists('dashboard_access_tokens');
    }
};

