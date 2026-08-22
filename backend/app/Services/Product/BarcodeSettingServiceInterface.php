<?php

namespace App\Services\Product;

use App\Models\Product\BarcodeSetting;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface BarcodeSettingServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): BarcodeSetting;

    public function findScoped(int $id): BarcodeSetting;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): BarcodeSetting;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;

    public function setDefault(int $id): BarcodeSetting;
}
