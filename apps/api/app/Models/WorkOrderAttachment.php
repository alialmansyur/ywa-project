<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkOrderAttachment extends Model
{
    protected $fillable = ['wo_id', 'file_path', 'file_name', 'type', 'uploaded_by'];

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function uploader()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
