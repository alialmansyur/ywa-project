<?php

namespace App\Http\Requests\WorkOrder;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'asset_id' => ['required', 'exists:assets,id'],
            'type' => ['required', 'in:preventive,corrective,breakdown,inspection'],
            'priority' => ['required', 'in:low,medium,high,critical'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'supervisor_id' => ['required', 'exists:users,id'],
            'scheduled_start' => ['nullable', 'date'],
            'scheduled_end' => ['nullable', 'date', 'after:scheduled_start'],
            'estimated_cost' => ['nullable', 'numeric', 'min:0'],
            'checklist' => ['nullable', 'array'],
            'checklist.*' => ['string'],
        ];
    }
}
