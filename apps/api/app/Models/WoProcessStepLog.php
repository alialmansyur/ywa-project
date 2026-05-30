<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessStepLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_id',
        'process_instance_id',
        'template_step_id',
        'step_order',
        'step_code',
        'step_name',
        'status',
        'process_in_at',
        'process_out_at',
        'est_minutes',
        'actual_minutes',
        'downtime_minutes',
        'performed_by',
        'approved_by',
        'reject_reason',
        'notes',
        'bay_in',
        'bay_in_at',
        'bay_out_at',
        'queue_minutes',
        'rework_count',
    ];

    protected function casts(): array
    {
        return [
            'process_in_at' => 'datetime',
            'process_out_at' => 'datetime',
            'bay_in_at' => 'datetime',
            'bay_out_at' => 'datetime',
        ];
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function processInstance()
    {
        return $this->belongsTo(WoProcessInstance::class, 'process_instance_id');
    }

    public function templateStep()
    {
        return $this->belongsTo(WoProcessTemplateStep::class, 'template_step_id');
    }
}
