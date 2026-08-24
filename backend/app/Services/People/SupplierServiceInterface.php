<?php

namespace App\Services\People;

use App\Models\People\Supplier;
use App\Services\BaseServiceInterface;

interface SupplierServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function create(array $data): Supplier;

    public function findScoped(int $id): Supplier;

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null}  $data
     */
    public function update(int $id, array $data): Supplier;
}
