<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class SparePart extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code', 'name', 'unit', 'category', 'brand',
        'part_number', 'min_stock', 'unit_price', 'notes', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active'  => 'boolean',
            'min_stock'  => 'integer',
            'unit_price' => 'float',
        ];
    }

    public function inventory()
    {
        return $this->hasMany(Inventory::class, 'part_id');
    }

    public function transactions()
    {
        return $this->hasMany(InventoryTransaction::class, 'part_id');
    }

    public function woUsages()
    {
        return $this->hasMany(WoPartsUsage::class, 'part_id');
    }

    public function scopeLowStock($query)
    {
        return $query->whereHas('inventory', function ($q) {
            $q->whereRaw('qty_available <= (SELECT min_stock FROM spare_parts WHERE spare_parts.id = inventory.part_id)');
        });
    }
}
