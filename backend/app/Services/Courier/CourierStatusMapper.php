<?php

namespace App\Services\Courier;

class CourierStatusMapper
{
    /**
     * Steadfast native statuses -> internal `deliveries.status` enum.
     * https://steadfast.com.bd (Packzy) courier status vocabulary.
     *
     * @var array<string, string>
     */
    protected static array $steadfastMap = [
        'pending' => 'packing',
        'delivered' => 'delivered',
        'partial_delivered' => 'delivering',
        'cancelled' => 'delivering',
        'hold' => 'delivering',
        'in_review' => 'delivering',
        'unknown' => 'delivering',
    ];

    /**
     * Pathao native statuses -> internal `deliveries.status` enum.
     * Approximate mapping based on Pathao's typical order-status vocabulary.
     *
     * @var array<string, string>
     */
    protected static array $pathaoMap = [
        'Pending' => 'packing',
        'Pickup_Requested' => 'packing',
        'Assigned_for_Pickup' => 'packing',
        'Picked' => 'delivering',
        'In_Transit' => 'delivering',
        'Received_at_Sorting_Hub' => 'delivering',
        'Delivered' => 'delivered',
        'Partial_Delivery' => 'delivering',
        'Returned' => 'delivering',
        'Cancelled' => 'delivering',
    ];

    /**
     * @return 'packing'|'delivering'|'delivered'
     */
    public static function toDeliveryStatus(string $courierType, string $status): string
    {
        $map = match ($courierType) {
            'steadfast' => self::$steadfastMap,
            'pathao' => self::$pathaoMap,
            default => [],
        };

        return $map[$status] ?? 'delivering';
    }
}
