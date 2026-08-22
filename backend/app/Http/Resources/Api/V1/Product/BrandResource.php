<?php

namespace App\Http\Resources\Api\V1\Product;

use App\Enums\Media\MediaCollectionEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

class BrandResource extends JsonResource
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
            'name' => $this->name,
            'image' => $this->imageUrl(),
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function imageUrl(): ?string
    {
        $media = $this->getFirstMedia(MediaCollectionEnum::ProductBrandsImage->value);

        if (! $media) {
            return null;
        }

        return URL::temporarySignedRoute('v1.media.show', now()->addMinutes(30), ['media' => $media->id]);
    }
}
