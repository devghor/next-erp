<?php

namespace App\Http\Resources\Api\V1\Web\Auth;

use App\Http\Resources\Api\V1\Web\Setting\CompanyResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'companies' => CompanyResource::collection($this->whenLoaded('companies')),
        ];
    }
}
