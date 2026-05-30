<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetLocation extends Model
{
    use HasFactory;

    protected $fillable = ['asset_id', 'lat', 'lng', 'address', 'recorded_by'];

    protected function casts(): array
    {
        return [
            'lat' => 'float',
            'lng' => 'float',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function recorder()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
