<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

class Asset extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $fillable = [
        'public_uuid',
        'code',
        'io_code',
        'name',
        'brand',
        'model',
        'company_code',
        'plant_code',
        'plant',
        'year',
        'category_id',
        'status',
        'current_hm',
        'current_km',
        'qr_code',
        'serial_number',
        'chasis_no',
        'engine_number',
        'engine_no',
        'sap_asset_no',
        'asset_no',
        'plate_number',
        'veh_plate_no',
        'notes',
        'photo',
    ];

    protected function casts(): array
    {
        return [
            'current_hm' => 'float',
            'current_km' => 'float',
            'year' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (self $asset): void {
            if (blank($asset->public_uuid)) {
                $asset->public_uuid = (string) Str::uuid();
            }

            if (blank($asset->qr_code)) {
                $asset->qr_code = 'TAPG-' . strtoupper(Str::random(8));
            }
        });
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()->logOnly(['status', 'current_hm', 'current_km']);
    }

    public function category()
    {
        return $this->belongsTo(AssetCategory::class, 'category_id');
    }

    public function locations()
    {
        return $this->hasMany(AssetLocation::class);
    }

    public function latestLocation()
    {
        return $this->hasOne(AssetLocation::class)->latestOfMany();
    }

    public function documents()
    {
        return $this->hasMany(AssetDocument::class);
    }

    public function photos()
    {
        return $this->hasMany(AssetPhoto::class)->orderBy('sort_order')->orderBy('id');
    }

    public function preventiveSetting()
    {
        return $this->hasOne(AssetPreventiveSetting::class);
    }

    public function workshopHistories()
    {
        return $this->hasMany(AssetWorkshopHistory::class)->latest('date_in');
    }

    public function hmLogs()
    {
        return $this->hasMany(HmLog::class);
    }

    public function maintenanceSchedules()
    {
        return $this->hasMany(MaintenanceSchedule::class);
    }

    public function p2hSubmissions()
    {
        return $this->hasMany(P2hSubmission::class);
    }

    public function workOrders()
    {
        return $this->hasMany(WorkOrder::class);
    }

    public function assignments()
    {
        return $this->hasMany(AssetAssignment::class);
    }

    public function activeAssignment()
    {
        return $this->hasOne(AssetAssignment::class)->whereNull('released_at')->latestOfMany('assigned_at');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
