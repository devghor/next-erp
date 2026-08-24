<?php

namespace App\Services\Sale;

use App\Models\Sale\Courier;
use App\Services\BaseServiceInterface;

interface CourierServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, type: string}  $data
     */
    public function create(array $data): Courier;

    public function findScoped(int $id): Courier;

    /**
     * @param  array{name: string, type: string}  $data
     */
    public function update(int $id, array $data): Courier;
}
