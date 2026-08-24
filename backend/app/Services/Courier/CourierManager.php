<?php

namespace App\Services\Courier;

use App\Models\Sale\Courier;

class CourierManager
{
    public static function resolve(Courier $courier): ?CourierInterface
    {
        return match ($courier->type) {
            'steadfast' => new SteadfastCourier($courier),
            'pathao' => new PathaoCourier($courier),
            default => null,
        };
    }
}
