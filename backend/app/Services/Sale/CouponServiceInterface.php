<?php

namespace App\Services\Sale;

use App\Models\Sale\Coupon;
use App\Services\BaseServiceInterface;

interface CouponServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array{code: string, name?: string|null, type: string, amount: float, minimum_amount?: float, quantity: int, expired_date: string}  $data
     */
    public function create(array $data): Coupon;

    public function findScoped(int $id): Coupon;

    /**
     * @param  array{code: string, name?: string|null, type: string, amount: float, minimum_amount?: float, quantity: int, expired_date: string}  $data
     */
    public function update(int $id, array $data): Coupon;

    public function generateCode(): string;

    /**
     * Server-side validation + discount calculation for a coupon being applied
     * against a sale's grand total. Called by the Sale checkout flow.
     *
     * @return array{valid: bool, discount: float, message: ?string}
     */
    public function validateForSale(Coupon $coupon, float $grandTotal): array;
}
