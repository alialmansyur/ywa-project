<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class P2hTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'asset_category_id',
        'items',
        'applies_to_all_assets',
        'version',
        'effective_from',
        'effective_to',
        'change_notes',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected function casts(): array
    {
        return [
            'items'     => 'array',
            'is_active' => 'boolean',
            'applies_to_all_assets' => 'boolean',
            'effective_from' => 'date',
            'effective_to' => 'date',
        ];
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'asset_category_id');
    }

    public function submissions()
    {
        return $this->hasMany(P2hSubmission::class, 'template_id');
    }
}
