<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderComment extends Model
{
    protected $fillable = ['wo_id', 'user_id', 'message'];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
