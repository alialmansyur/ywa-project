<?php

namespace App\Http\Resources\Asset;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    public function toArray(Request ): array
    {
        return [
            'id' => ->id,
            'code' => ->code,
            'name' => ->name,
            'category' => ->whenLoaded('category'),
            'status' => ->status,
            'current_hm' => ->current_hm,
            'current_km' => ->current_km,
            'qr_code' => ->qr_code,
            'created_at' => ->created_at,
            'updated_at' => ->updated_at,
        ];
    }
}
