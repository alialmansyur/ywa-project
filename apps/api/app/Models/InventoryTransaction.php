<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InventoryTransaction extends Model
{
    protected $fillable = [
        'part_id', 'type', 'qty', 'unit_price',
        'reference_type', 'reference_id', 'processed_by', 'notes',
        'approval_status', 'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'qty'        => 'float',
            'unit_price' => 'float',
            'applied_at' => 'datetime',
        ];
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class, 'part_id');
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by');
    }
}
