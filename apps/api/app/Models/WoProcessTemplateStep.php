<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessTemplateStep extends Model
{
    use HasFactory;

    protected $fillable = [
        'template_id',
        'step_order',
        'step_code',
        'step_name',
        'sla_minutes',
        'requires_approval',
        'allow_parallel',
        'is_mandatory',
    ];

    protected function casts(): array
    {
        return [
            'requires_approval' => 'boolean',
            'allow_parallel' => 'boolean',
            'is_mandatory' => 'boolean',
        ];
    }

    public function template()
    {
        return $this->belongsTo(WoProcessTemplate::class, 'template_id');
    }
}
