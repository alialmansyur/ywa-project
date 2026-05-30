<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class P2hItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'submission_id', 'group', 'item_name', 'condition', 'notes', 'photo_url',
    ];

    public function submission()
    {
        return $this->belongsTo(P2hSubmission::class, 'submission_id');
    }
}
