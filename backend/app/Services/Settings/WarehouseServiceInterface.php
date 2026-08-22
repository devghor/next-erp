<?php

namespace App\Services\Settings;

use App\Models\Settings\Warehouse;
use App\Services\BaseServiceInterface;

interface WarehouseServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function create(array $data): Warehouse;

    public function findScoped(int $id): Warehouse;

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function update(int $id, array $data): Warehouse;
}
