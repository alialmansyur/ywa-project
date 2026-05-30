<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WoProcessTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'wo_type',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function steps()
    {
        return $this->hasMany(WoProcessTemplateStep::class, 'template_id')->orderBy('step_order');
    }

    public function instances()
    {
        return $this->hasMany(WoProcessInstance::class, 'template_id');
    }
}
