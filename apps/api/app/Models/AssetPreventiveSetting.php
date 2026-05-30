<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetPreventiveSetting extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'trigger_type',
        'alert_before_value',
        'escalation_target',
        'auto_create_work_order',
        'notification_channels',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'alert_before_value' => 'float',
            'auto_create_work_order' => 'boolean',
            'notification_channels' => 'array',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }
}
