<?php

namespace App\Http\Controllers\Api\V1\Media;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MediaController extends Controller
{
    /**
     * Stream private media inline. Only reachable via a signed URL — the
     * signature is the authorization, since the browser can't attach an
     * Authorization header for a plain <img src>.
     */
    public function show(Media $media): StreamedResponse
    {
        return Storage::disk($media->disk)->response(
            $media->getPathRelativeToRoot(),
            $media->file_name,
            ['Content-Type' => $media->mime_type]
        );
    }
}
