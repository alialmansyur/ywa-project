<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MaintenanceSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id', 'type', 'name', 'interval_hm', 'interval_km',
        'last_done_hm', 'last_done_km', 'last_done_at',
        'next_due_at', 'next_due_hm', 'next_due_km', 'status', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'interval_hm'  => 'float',
            'interval_km'  => 'float',
            'last_done_hm' => 'float',
            'last_done_km' => 'float',
            'next_due_hm'  => 'float',
            'next_due_km'  => 'float',
            'last_done_at' => 'datetime',
            'next_due_at'  => 'datetime',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class, 'schedule_id');
    }

    public function scopeUpcoming($query, int $days = 7)
    {
        return $query->where('next_due_at', '<=', now()->addDays($days))
            ->whereIn('status', ['scheduled', 'due']);
    }

    public function scopeOverdue($query)
    {
        return $query->where('status', 'overdue');
    }
}
