<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WoPartsUsage extends Model
{
    protected $table = 'wo_parts_usage';

    protected $fillable = ['wo_id', 'part_id', 'qty_requested', 'qty_used', 'unit_price'];

    protected function casts(): array
    {
        return [
            'qty_requested' => 'float',
            'qty_used'      => 'float',
            'unit_price'    => 'float',
        ];
    }

    public function workOrder()
    {
        return $this->belongsTo(WorkOrder::class, 'wo_id');
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class, 'part_id');
    }
}
