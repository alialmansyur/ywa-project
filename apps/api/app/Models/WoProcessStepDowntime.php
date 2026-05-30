<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessStepDowntime extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_process_step_log_id',
        'wo_id',
        'hold_start_at',
        'hold_end_at',
        'duration_minutes',
        'reason',
        'held_by',
        'resumed_by',
    ];

    protected function casts(): array
    {
        return [
            'hold_start_at' => 'datetime',
            'hold_end_at' => 'datetime',
            'duration_minutes' => 'integer',
        ];
    }

    public function stepLog()
    {
        return $this->belongsTo(WoProcessStepLog::class, 'wo_process_step_log_id');
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function heldBy()
    {
        return $this->belongsTo(User::class, 'held_by');
    }

    public function resumedBy()
    {
        return $this->belongsTo(User::class, 'resumed_by');
    }
}
