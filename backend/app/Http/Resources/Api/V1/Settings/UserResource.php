<?php

namespace App\Http\Resources\Api\V1\Settings;

use App\Enums\Media\MediaCollectionEnum;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\URL;

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
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'profile_picture' => $this->profilePictureUrl(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    protected function profilePictureUrl(): ?string
    {
        $media = $this->getFirstMedia(MediaCollectionEnum::SettingsUsersProfilePicture->value);

        if (! $media) {
            return null;
        }

        return URL::temporarySignedRoute('v1.media.show', now()->addMinutes(30), ['media' => $media->id]);
    }
}
