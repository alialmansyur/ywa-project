<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * Urutan penting: Users -> Menu -> Menu Services -> Assets -> WorkOrders -> Process Templates
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            AppMenuSeeder::class,
            MenuVisibilityPermissionSeeder::class,
            NormalizeAdminMenuPermissionSeeder::class,
            MasterDataAccessSeeder::class,
            AppMenuServiceSeeder::class,
            PlatformRoleMenuSeeder::class,
            AssetSeeder::class,
            P2hGeneralChecklistSeeder::class,
            GuideChapterSeeder::class,
            WorkOrderSeeder::class,
            WorkOrderProcessTemplateSeeder::class,
        ]);

        $this->command?->info('');
        $this->command?->info('TAPG Database seeded successfully!');
        $this->command?->info('');
        $this->command?->table(
            ['Role', 'Email', 'Password'],
            [
                ['super_admin', 'superadmin@tapg.local', 'password'],
                ['admin', 'admin@tapg.local', 'password'],
                ['supervisor', 'supervisor@tapg.local', 'password'],
                ['mechanic', 'mechanic@tapg.local', 'password'],
                ['operator', 'operator@tapg.local', 'password'],
                ['viewer', 'viewer@tapg.local', 'password'],
            ]
        );
    }
}
