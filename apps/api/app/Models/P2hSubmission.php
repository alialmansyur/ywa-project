<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class P2hSubmission extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id', 'operator_id', 'template_id', 'reviewed_by',
        'template_version', 'status', 'geolat', 'geolng', 'signature_url',
        'review_notes', 'submitted_at', 'reviewed_at',
        'submission_date',
    ];

    protected function casts(): array
    {
        return [
            'geolat'       => 'float',
            'geolng'       => 'float',
            'submitted_at' => 'datetime',
            'reviewed_at'  => 'datetime',
            'submission_date' => 'date',
        ];
    }

    public function asset()
    {
        return $this->belongsTo(Asset::class);
    }

    public function operator()
    {
        return $this->belongsTo(User::class, 'operator_id');
    }

    public function template()
    {
        return $this->belongsTo(P2hTemplate::class, 'template_id');
    }

    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    public function items()
    {
        return $this->hasMany(P2hItem::class, 'submission_id');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
