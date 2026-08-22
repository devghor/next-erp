---
glob: app/**
---

# File Uploads — Media Library Only

Always use Spatie Media Library (`spatie/laravel-medialibrary`) to upload, store, retrieve, or manage any file (images, documents, exports, etc). Never write raw `Storage::put`/`move`/`$request->file()->store()` code for application file uploads, and never add ad-hoc file columns (e.g. `avatar_path`) to a model.

- Model must implement `HasMedia` and use `InteractsWithMedia` (see `app/Models/User.php`).
- Define collections in `app/Enums/Media/MediaCollectionEnum.php`, not as raw strings.
- Attach files with `$model->addMedia($file)->toMediaCollection(MediaCollectionEnum::X->value)`.
- Retrieve URLs via the model's media relation / `getFirstMediaUrl()`, not by building storage paths manually.
- Serve private media through `App\Http\Controllers\Api\V1\Media\MediaController` (signed URL), not a public disk link.
