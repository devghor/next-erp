<?php

namespace App\Services\Courier;

use App\Models\People\Customer;
use App\Models\Sale\Courier;
use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Http;
use Throwable;

class SteadfastCourier implements CourierInterface
{
    protected string $baseUrl = 'https://portal.packzy.com/api/v1';

    public function __construct(protected Courier $courier) {}

    public function createOrder(array $deliveryData, Sale $sale, Customer $customer): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->post("{$this->baseUrl}/create_order", [
                    'invoice' => $sale->reference_no,
                    'recipient_name' => $deliveryData['recipient_name'],
                    'recipient_phone' => $deliveryData['recipient_phone'],
                    'recipient_address' => $deliveryData['recipient_address'],
                    'cod_amount' => (int) $deliveryData['cod_amount'],
                    'note' => $deliveryData['note'] ?? null,
                ])
                ->throw()
                ->json();

            $consignment = $response['consignment'] ?? [];

            return [
                'success' => true,
                'tracking_code' => $consignment['tracking_code'] ?? null,
                'status' => $consignment['status'] ?? 'pending',
                'error' => null,
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'tracking_code' => null,
                'status' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    public function trackOrder(string $trackingCode): array
    {
        try {
            $response = Http::withHeaders($this->headers())
                ->get("{$this->baseUrl}/status_by_trackingcode/{$trackingCode}")
                ->throw()
                ->json();

            return [
                'success' => true,
                'tracking_code' => $trackingCode,
                'status' => $response['delivery_status'] ?? null,
                'error' => null,
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'tracking_code' => $trackingCode,
                'status' => null,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * @return array<string, string>
     */
    protected function headers(): array
    {
        return [
            'Api-Key' => (string) $this->courier->api_key,
            'Secret-Key' => (string) $this->courier->secret_key,
        ];
    }
}
