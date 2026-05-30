<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPushToken extends Model
{
    protected $fillable = [
        'user_id',
        'provider',
        'push_token',
        'device_id',
        'platform',
        'is_active',
        'last_used_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_used_at' => 'datetime',
        ];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
