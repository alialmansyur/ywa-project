<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderStatusLog extends Model
{
    protected $fillable = [
        'wo_id', 'from_status', 'to_status', 'changed_by', 'notes', 'changed_at',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }
}
