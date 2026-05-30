<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class HmLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id', 'hm_value', 'km_value', 'recorded_by', 'notes', 'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'hm_value'    => 'float',
            'km_value'    => 'float',
            'recorded_at' => 'datetime',
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
