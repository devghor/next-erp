<?php

namespace App\Services\Product;

use App\Models\Product\Category;
use App\Services\BaseServiceInterface;

interface CategoryServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, parent_id?: int|null, image?: \Illuminate\Http\UploadedFile|null}  $data
     */
    public function create(array $data): Category;

    public function findScoped(int $id): Category;

    /**
     * @param  array{name: string, parent_id?: int|null, image?: \Illuminate\Http\UploadedFile|null}  $data
     */
    public function update(int $id, array $data): Category;
}
