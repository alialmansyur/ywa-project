<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessEvent extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_id',
        'event_key',
        'source_step_order',
        'target_step_order',
        'triggered_by',
        'payload_json',
        'triggered_at',
    ];

    protected function casts(): array
    {
        return [
            'payload_json' => 'array',
            'triggered_at' => 'datetime',
        ];
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }
}
