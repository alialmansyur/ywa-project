<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class WorkOrder extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'code', 'sap_reference_no', 'wo_source', 'jobcard_no', 'jobcard_status', 'jobcard_generated_at', 'jobcard_printed_at', 'jobcard_acknowledged_at', 'asset_id', 'schedule_id', 'type', 'priority', 'title', 'description',
        'status', 'process_template_id', 'is_process_tracking_enabled', 'supervisor_id', 'created_by', 'approved_by',
        'scheduled_start', 'scheduled_end', 'actual_start', 'actual_end',
        'approved_at', 'estimated_cost', 'actual_cost', 'completion_notes', 'cancel_reason',
    ];

    protected function casts(): array
    {
        return [
            'scheduled_start' => 'datetime',
            'scheduled_end' => 'datetime',
            'actual_start' => 'datetime',
            'actual_end' => 'datetime',
            'approved_at' => 'datetime',
            'jobcard_generated_at' => 'datetime',
            'jobcard_printed_at' => 'datetime',
            'jobcard_acknowledged_at' => 'datetime',
            'estimated_cost' => 'float',
            'actual_cost' => 'float',
            'is_process_tracking_enabled' => 'boolean',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status', 'approved_by', 'actual_cost', 'cancel_reason']);
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    public function schedule()
    {
        return $this->belongsTo(MaintenanceSchedule::class, 'schedule_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function assignees()
    {
        return $this->belongsToMany(User::class, 'work_order_assignees', 'wo_id', 'user_id')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function checklists()
    {
        return $this->hasMany(WorkOrderChecklist::class, 'wo_id');
    }

    public function attachments()
    {
        return $this->hasMany(WorkOrderAttachment::class, 'wo_id');
    }

    public function comments()
    {
        return $this->hasMany(WorkOrderComment::class, 'wo_id');
    }

    public function statusLogs()
    {
        return $this->hasMany(WorkOrderStatusLog::class, 'wo_id');
    }

    public function partsUsage()
    {
        return $this->hasMany(WoPartsUsage::class, 'wo_id');
    }

    public function processTemplate()
    {
        return $this->belongsTo(WoProcessTemplate::class, 'process_template_id');
    }

    public function processInstances()
    {
        return $this->hasMany(WoProcessInstance::class, 'wo_id');
    }

    public function processStepLogs()
    {
        return $this->hasMany(WoProcessStepLog::class, 'wo_id');
    }

    public function processEvents()
    {
        return $this->hasMany(WoProcessEvent::class, 'wo_id');
    }

    public function processAbnormalities()
    {
        return $this->hasMany(WoProcessAbnormality::class, 'wo_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByPriority($query, string $priority)
    {
        return $query->where('priority', $priority);
    }
}
