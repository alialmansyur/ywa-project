<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    protected $fillable = [
        'user_id',
        'employee_code',
        'job_code',
        'sex',
        'employment_status',
        'company',
        'department',
        'site_location',
        'supervisor_name',
        'birth_place',
        'birth_date',
        'hire_date',
        'contract_start_date',
        'contract_end_date',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'meta',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'hire_date' => 'date',
            'contract_start_date' => 'date',
            'contract_end_date' => 'date',
            'meta' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
