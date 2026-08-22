<?php

namespace App\Services\Product;

use App\Models\Product\Brand;
use App\Services\BaseServiceInterface;
use Illuminate\Http\UploadedFile;

interface BrandServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, image?: UploadedFile|null}  $data
     */
    public function create(array $data): Brand;

    public function findScoped(int $id): Brand;

    /**
     * @param  array{name: string, image?: UploadedFile|null}  $data
     */
    public function update(int $id, array $data): Brand;
}
