<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles, LogsActivity;

    protected string $guard_name = 'web';

    protected $fillable = [
        'name', 'email', 'phone', 'password', 'avatar', 'is_active', 'fcm_token',
    ];

    protected $hidden = [
        'password', 'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['name', 'email', 'is_active']);
    }

    public function profile()
    {
        return $this->hasOne(UserProfile::class);
    }

    public function assetLocations()
    {
        return $this->hasMany(AssetLocation::class, 'recorded_by');
    }

    public function hmLogs()
    {
        return $this->hasMany(HmLog::class, 'recorded_by');
    }

    public function p2hSubmissions()
    {
        return $this->hasMany(P2hSubmission::class, 'operator_id');
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'supervisor_id');
    }

    public function assignedWorkOrders()
    {
        return $this->belongsToMany(WorkOrder::class, 'work_order_assignees', 'user_id', 'wo_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function appNotifications()
    {
        return $this->hasMany(AppNotification::class);
    }

    public function assetAssignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function pushTokens()
    {
        return $this->hasMany(UserPushToken::class);
    }

    protected function getDefaultGuardName(): string
    {
        return $this->guard_name;
    }
}
