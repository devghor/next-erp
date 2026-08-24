<?php

namespace App\Services\People;

use App\Models\People\Customer;
use App\Services\BaseServiceInterface;

interface CustomerServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, tax_number?: string|null, credit_limit?: float|null}  $data
     */
    public function create(array $data): Customer;

    public function findScoped(int $id): Customer;

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, tax_number?: string|null, credit_limit?: float|null}  $data
     */
    public function update(int $id, array $data): Customer;
}
