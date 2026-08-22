<?php

namespace App\Http\Resources\Api\V1\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomFieldResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'belongs_to' => $this->belongs_to,
            'name' => $this->name,
            'type' => $this->type,
            'options' => $this->options,
            'is_table' => $this->is_table,
            'is_required' => $this->is_required,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
