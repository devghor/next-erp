<?php

namespace App\Services\Settings;

use App\Models\Settings\Currency;
use App\Services\BaseServiceInterface;

interface CurrencyServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{name: string, code: string, symbol?: string|null, exchange_rate: float}  $data
     */
    public function create(array $data): Currency;

    public function findScoped(int $id): Currency;

    /**
     * @param  array{name: string, code: string, symbol?: string|null, exchange_rate: float}  $data
     */
    public function update(int $id, array $data): Currency;
}
