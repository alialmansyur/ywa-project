<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class ResetPasswordSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('Ywa@2026');
        
        User::whereDoesntHave('roles', function ($query) {
            $query->where('name', 'superadmin');
        })->update(['password' => $password]);
        
        $this->command->info('Password user non-admin berhasil direset ke default (Ywa@2026).');
    }
}
