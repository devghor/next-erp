<?php

namespace App\Services\Product;

use App\Models\Product\Unit;
use App\Services\BaseServiceInterface;

interface UnitServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{code: string, name: string, base_unit_id?: int|null, operator?: string, operation_value?: float|string}  $data
     */
    public function create(array $data): Unit;

    public function findScoped(int $id): Unit;

    /**
     * @param  array{code: string, name: string, base_unit_id?: int|null, operator?: string, operation_value?: float|string}  $data
     */
    public function update(int $id, array $data): Unit;
}
