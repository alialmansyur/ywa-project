<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class MobileAccessUserSeeder extends Seeder
{
    public function run(): void
    {
        $driverRole = Role::firstOrCreate(['name' => 'driver']);
        $operatorRole = Role::firstOrCreate(['name' => 'operator']);

        if ($driverRole->permissions()->count() === 0) {
            $driverRole->syncPermissions([
                'view dashboard',
                'view assets',
                'view p2h',
                'view work-orders',
                'create work-orders',
                'execute work-orders',
                'view schedules',
            ]);
        }

        $this->normalizeExistingEmailsToYwaLocal();
        $this->seedDummyRoleUsers('driver', 5, '081100100');
        $this->seedDummyRoleUsers('operator', 5, '081100200');
    }

    private function normalizeExistingEmailsToYwaLocal(): void
    {
        $users = User::query()->orderBy('id')->get();
        foreach ($users as $user) {
            $currentEmail = strtolower((string) $user->email);
            if (preg_match('/^(driver[1-5]|operator[1-5])@ywa\.local$/', $currentEmail)) {
                continue;
            }

            if (preg_match('/^(driver|operator)\s+dummy/i', (string) $user->name)) {
                continue;
            }

            $firstName = Str::slug((string) Str::of($user->name)->before(' '), '');
            $baseLocal = strtolower(trim($firstName));
            if ($baseLocal === '') {
                $baseLocal = 'user';
            }
            if (strlen($baseLocal) > 14) {
                $baseLocal = substr($baseLocal, 0, 14);
            }

            $newEmail = "{$baseLocal}@ywa.local";
            if (User::query()->where('email', $newEmail)->where('id', '!=', $user->id)->exists()) {
                $newEmail = "{$baseLocal}{$user->id}@ywa.local";
            }

            if ($newEmail !== $user->email) {
                $user->forceFill(['email' => $newEmail])->save();
            }
        }
    }

    private function seedDummyRoleUsers(string $roleName, int $count, string $phonePrefix): void
    {
        for ($i = 1; $i <= $count; $i++) {
            $email = "{$roleName}{$i}@ywa.local";
            $user = User::updateOrCreate(
                ['email' => $email],
                [
                    'name' => ucfirst($roleName) . " Dummy {$i}",
                    'phone' => $phonePrefix . str_pad((string) $i, 2, '0', STR_PAD_LEFT),
                    'password' => Hash::make('password'),
                    'is_active' => true,
                ],
            );
            $user->syncRoles([$roleName]);
        }
    }
}
