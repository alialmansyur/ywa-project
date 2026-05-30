<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class NewMenusSeeder extends Seeder
{
    public function run(): void
    {
        $settingsId = DB::table('app_menus')->where('menu_key', 'settings')->value('id');

        $menus = [
            ['menu_key' => 'email-templates', 'label' => 'Email Templates', 'route' => '/settings/email-templates', 'sort_order' => 150, 'permission_prefix' => 'settings', 'required_permission' => 'manage settings', 'parent_id' => $settingsId],
        ];

        foreach ($menus as $menu) {
            DB::table('app_menus')->updateOrInsert(
                ['menu_key' => $menu['menu_key']],
                $menu
            );
        }
    }
}
