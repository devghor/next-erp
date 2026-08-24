<?php

namespace App\Services\People;

use App\Models\People\SaleAgent;
use App\Services\BaseServiceInterface;

interface SaleAgentServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null, commission_rate?: float|null}  $data
     */
    public function create(array $data): SaleAgent;

    public function findScoped(int $id): SaleAgent;

    /**
     * @param  array{name: string, phone?: string|null, email?: string|null, address?: string|null, commission_rate?: float|null}  $data
     */
    public function update(int $id, array $data): SaleAgent;
}
