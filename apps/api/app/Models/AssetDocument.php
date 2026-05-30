<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AssetDocument extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id', 'type', 'file_path', 'document_number',
        'issued_at', 'expired_at', 'notes',
    ];

    protected function casts(): array
    {
        return [
            'issued_at'  => 'date',
            'expired_at' => 'date',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function scopeExpiringSoon($query, int $days = 30)
    {
        return $query->where('expired_at', '<=', now()->addDays($days))
            ->where('expired_at', '>=', now());
    }
}
