<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetCategory extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'icon', 'description', 'is_active'];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function assets()
    {
        return $this->hasMany(Asset::class, 'category_id');
    }

    public function p2hTemplates()
    {
        return $this->hasMany(P2hTemplate::class, 'asset_category_id');
    }
}
