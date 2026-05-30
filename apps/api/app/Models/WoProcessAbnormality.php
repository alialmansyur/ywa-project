<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessAbnormality extends Model
{
    use HasFactory;

    protected $fillable = [
        'wo_id',
        'process_instance_id',
        'step_log_id',
        'category',
        'severity',
        'status',
        'summary',
        'details_json',
        'reported_by',
        'resolved_by',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'details_json' => 'array',
            'resolved_at' => 'datetime',
        ];
    }
}
