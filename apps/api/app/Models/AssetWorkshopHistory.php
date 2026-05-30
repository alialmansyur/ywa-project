<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetWorkshopHistory extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'reference_no',
        'category',
        'date_in',
        'date_out',
        'issue',
        'action_taken',
        'cost',
        'downtime_hours',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_in' => 'date',
            'date_out' => 'date',
            'cost' => 'float',
            'downtime_hours' => 'integer',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
