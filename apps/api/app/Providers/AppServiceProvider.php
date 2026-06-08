<?php

namespace App\Providers;

use App\Models\AppNotification;
use App\Policies\AppNotificationPolicy;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::policy(AppNotification::class, AppNotificationPolicy::class);
        RateLimiter::for('api-authenticated', function (Request $request) {
            $userKey = (string) optional($request->user())->getAuthIdentifier();
            $clientIp = (string) $request->ip();
            $key = $userKey !== '' ? $userKey : $clientIp;
            $path = trim($request->path(), '/');

            if ($request->isMethod('GET') && $path === 'api/v1/settings/menu-access') {
                return Limit::perMinute(1200)->by('menu-access:' . $key);
            }

            if ($request->isMethod('GET')) {
                return Limit::perMinute(600)->by('api-read:' . $key);
            }

            return Limit::perMinute(300)->by('api-write:' . $key);
        });

        try {
            $smtp = \Illuminate\Support\Facades\DB::table('smtp_configurations')
                ->where('is_enabled', true)
                ->where('is_default', true)
                ->first();

            if ($smtp) {
                config([
                    'mail.mailers.smtp.host' => $smtp->host,
                    'mail.mailers.smtp.port' => $smtp->port,
                    'mail.mailers.smtp.username' => $smtp->username,
                    'mail.mailers.smtp.password' => $smtp->password_encrypted ? \Illuminate\Support\Facades\Crypt::decryptString($smtp->password_encrypted) : null,
                    'mail.mailers.smtp.encryption' => $smtp->encryption !== 'none' ? $smtp->encryption : null,
                    'mail.from.address' => $smtp->from_email,
                    'mail.from.name' => $smtp->from_name,
                    'mail.default' => 'smtp',
                ]);
            }
        } catch (\Throwable $e) {
            // Ignore error during initial migration/setup
        }
    }
}
