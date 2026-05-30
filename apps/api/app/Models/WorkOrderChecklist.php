<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderChecklist extends Model
{
    protected $fillable = ['wo_id', 'item', 'is_done', 'done_by', 'done_at'];

    protected function casts(): array
    {
        return [
            'is_done' => 'boolean',
            'done_at' => 'datetime',
        ];
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function completedBy()
    {
        return $this->belongsTo(User::class, 'done_by');
    }
}
