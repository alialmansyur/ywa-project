<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessInstance extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_id',
        'template_id',
        'current_step_order',
        'state',
    ];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function template()
    {
        return $this->belongsTo(WoProcessTemplate::class, 'template_id');
    }

    public function stepLogs()
    {
        return $this->hasMany(WoProcessStepLog::class, 'process_instance_id')->orderBy('step_order');
    }
}
