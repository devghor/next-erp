<?php

namespace App\Services\People;

use App\Models\People\Biller;
use App\Services\BaseServiceInterface;

interface BillerServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, vat_number?: string|null}  $data
     */
    public function create(array $data): Biller;

    public function findScoped(int $id): Biller;

    /**
     * @param  array{name: string, company_name?: string|null, phone?: string|null, email?: string|null, address?: string|null, city?: string|null, state?: string|null, postal_code?: string|null, country?: string|null, vat_number?: string|null}  $data
     */
    public function update(int $id, array $data): Biller;
}
