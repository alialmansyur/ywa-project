<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderAssignee extends Model
{
    protected $fillable = ['wo_id', 'user_id', 'role'];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
