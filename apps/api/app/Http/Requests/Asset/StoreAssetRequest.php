<?php

namespace App\Http\Requests\Asset;

use Illuminate\Foundation\Http\FormRequest;

class StoreAssetRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'string', 'unique:assets,code'],
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:100'],
            'model' => ['nullable', 'string', 'max:100'],
            'year' => ['nullable', 'integer', 'min:1990', 'max:2100'],
            'category_id' => ['required', 'exists:asset_categories,id'],
            'status' => ['nullable', 'in:active,inactive,maintenance,breakdown'],
            'current_hm' => ['nullable', 'numeric', 'min:0'],
            'current_km' => ['nullable', 'numeric', 'min:0'],
            'serial_number' => ['nullable', 'string'],
            'plate_number' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ];
    }
}
