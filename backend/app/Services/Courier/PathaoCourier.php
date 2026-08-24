<?php

namespace App\Services\Courier;

use App\Models\People\Customer;
use App\Models\Sale\Courier;
use App\Models\Sale\Sale;
use Illuminate\Support\Facades\Http;
use Throwable;

class PathaoCourier implements CourierInterface
{
    public function __construct(protected Courier $courier) {}

    public function createOrder(array $deliveryData, Sale $sale, Customer $customer): array
    {
        try {
            $token = $this->getToken();
            $storeId = $this->getStoreId($token);

            $response = Http::withToken($token)
                ->post("{$this->courier->base_url}/aladdin/api/v1/orders", [
                    'store_id' => $storeId,
                    'merchant_order_id' => $sale->reference_no,
                    'recipient_name' => $deliveryData['recipient_name'],
                    'recipient_phone' => $deliveryData['recipient_phone'],
                    'recipient_address' => $deliveryData['recipient_address'],
                    'amount_to_collect' => (int) $deliveryData['cod_amount'],
                    'delivery_type' => 48,
                    'item_quantity' => 1,
                    'item_weight' => 1,
                    'item_type' => 2,
                ])
                ->throw()
                ->json();

            $data = $response['data'] ?? [];

            return [
                'success' => true,
                'tracking_code' => $data['consignment_id'] ?? null,
                'status' => $data['order_status'] ?? 'Pending',
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
            $token = $this->getToken();

            $response = Http::withToken($token)
                ->get("{$this->courier->base_url}/aladdin/api/v1/orders/{$trackingCode}")
                ->throw()
                ->json();

            $data = $response['data'] ?? [];

            return [
                'success' => true,
                'tracking_code' => $trackingCode,
                'status' => $data['order_status'] ?? null,
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

    protected function getToken(): string
    {
        $response = Http::asForm()
            ->post("{$this->courier->base_url}/aladdin/api/v1/issue-token", [
                'client_id' => $this->courier->client_id,
                'client_secret' => $this->courier->client_secret,
                'username' => $this->courier->username,
                'password' => $this->courier->password,
                'grant_type' => 'password',
            ])
            ->throw()
            ->json();

        return $response['access_token'];
    }

    protected function getStoreId(string $token): int
    {
        $response = Http::withToken($token)
            ->get("{$this->courier->base_url}/aladdin/api/v1/stores")
            ->throw()
            ->json();

        return (int) ($response['data']['data'][0]['store_id'] ?? 0);
    }
}
