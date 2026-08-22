<?php

namespace App\Services\Settings;

use App\Models\Settings\Tax;
use App\Services\BaseServiceInterface;

interface TaxServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, rate: float}  $data
     */
    public function create(array $data): Tax;

    public function findScoped(int $id): Tax;

    /**
     * @param  array{name: string, rate: float}  $data
     */
    public function update(int $id, array $data): Tax;
}
