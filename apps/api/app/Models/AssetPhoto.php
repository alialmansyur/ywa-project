<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetPhoto extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'title',
        'photo_path',
        'is_primary',
        'sort_order',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
