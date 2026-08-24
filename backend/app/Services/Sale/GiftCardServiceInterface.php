<?php

namespace App\Services\Sale;

use App\Models\Sale\GiftCard;
use App\Services\BaseServiceInterface;

interface GiftCardServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{card_no: string, customer_id?: int|null, user_id?: int|null, amount?: float, expired_date?: string|null}  $data
     */
    public function create(array $data): GiftCard;

    public function findScoped(int $id): GiftCard;

    /**
     * @param  array{card_no: string, customer_id?: int|null, user_id?: int|null, amount?: float, expired_date?: string|null}  $data
     */
    public function update(int $id, array $data): GiftCard;

    public function recharge(int $id, float $amount, ?int $userId): GiftCard;
}
