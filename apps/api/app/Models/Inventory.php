<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    protected $table = 'inventory';

    protected $fillable = ['part_id', 'location', 'qty_available'];

    protected function casts(): array
    {
        return [
            'qty_available' => 'float',
        ];
    }

    public function sparePart()
    {
        return $this->belongsTo(SparePart::class, 'part_id');
    }
}
