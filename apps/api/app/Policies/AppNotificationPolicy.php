<?php

namespace App\Policies;

use App\Models\AppNotification;
use App\Models\User;

class AppNotificationPolicy
{
    public function update(User $user, AppNotification $appNotification): bool
    {
        return (int) $appNotification->user_id === (int) $user->id;
    }
}
