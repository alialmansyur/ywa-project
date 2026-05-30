<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class EmailTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'name',
        'subject',
        'body_html',
        'variables',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'variables' => 'array',
    ];
}
