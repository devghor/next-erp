<?php

namespace App\Services\Sale;

use App\Models\Sale\Courier;
use App\Models\Sale\Delivery;
use App\Models\Settings\Company;
use App\Services\Courier\CourierManager;
use App\Services\Courier\CourierStatusMapper;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeliveryService implements DeliveryServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function currentUserId(): ?int
    {
        /** @var (Authenticatable&object{id: int})|null $user */
        $user = Auth::user();

        return $user?->id;
    }

    protected function baseScopedQuery(): Builder
    {
        return Delivery::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['sale.customer', 'courier', 'user'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(deliveries.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['reference_no'] ?? null, fn (Builder $query, string $ref) => $query->where('deliveries.reference_no', 'like', "%{$ref}%"))
            ->when($filters['sale_id'] ?? null, fn (Builder $query, string $saleId) => $query->where('deliveries.sale_id', $saleId))
            ->when($filters['courier_id'] ?? null, fn (Builder $query, string $courierId) => $query->where('deliveries.courier_id', $courierId))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('deliveries.status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('deliveries.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('deliveries.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('deliveries.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('deliveries.created_at')
            ->get();
    }

    /**
     * @param  array{sale_id: int, courier_id?: int|null, address?: string|null, delivered_by?: string|null, recieved_by?: string|null, note?: string|null}  $data
     */
    public function create(array $data): Delivery
    {
        return DB::transaction(function () use ($data) {
            $delivery = Delivery::create([
                'company_id' => $this->activeCompany()->id,
                'reference_no' => 'DR-'.now()->format('Ymd').'-'.now()->format('His'),
                'sale_id' => $data['sale_id'],
                'user_id' => $this->currentUserId(),
                'courier_id' => $data['courier_id'] ?? null,
                'address' => $data['address'] ?? null,
                'delivered_by' => $data['delivered_by'] ?? null,
                'recieved_by' => $data['recieved_by'] ?? null,
                'note' => $data['note'] ?? null,
                'status' => 'packing',
            ]);

            $delivery->load(['sale.customer', 'courier']);

            $this->dispatchToCourier($delivery);

            return $delivery->fresh(['sale.customer', 'courier', 'user']);
        });
    }

    /**
     * Sends the order to the assigned courier's API, if one is configured.
     * A courier API failure never blocks the delivery record itself from
     * being created — it just leaves tracking_code null.
     */
    protected function dispatchToCourier(Delivery $delivery): void
    {
        /** @var Courier|null $courier */
        $courier = $delivery->courier;

        if (! $courier) {
            return;
        }

        $integration = CourierManager::resolve($courier);

        if (! $integration) {
            return;
        }

        $sale = $delivery->sale;
        $customer = $sale->customer;

        $result = $integration->createOrder([
            'recipient_name' => $customer->name,
            'recipient_phone' => $customer->phone ?? '',
            'recipient_address' => $delivery->address ?? $customer->address ?? '',
            'cod_amount' => (float) $sale->grand_total - (float) $sale->paid_amount,
            'note' => $delivery->note,
        ], $sale, $customer);

        if ($result['success'] ?? false) {
            $delivery->tracking_code = $result['tracking_code'] ?? null;
            $delivery->status = CourierStatusMapper::toDeliveryStatus($courier->type, $result['status'] ?? '');
            $delivery->save();
        }
    }

    public function findScoped(int $id): Delivery
    {
        return $this->baseScopedQuery()->with(['sale.customer', 'courier', 'user'])->where('deliveries.id', $id)->firstOrFail();
    }

    /**
     * @param  array{courier_id?: int|null, address?: string|null, delivered_by?: string|null, recieved_by?: string|null, note?: string|null, status?: string}  $data
     */
    public function update(int $id, array $data): Delivery
    {
        return DB::transaction(function () use ($id, $data) {
            $delivery = $this->findScoped($id);
            $delivery->fill($data);
            $delivery->save();

            return $delivery;
        });
    }

    public function track(int $id): Delivery
    {
        $delivery = $this->findScoped($id);

        /** @var Courier|null $courier */
        $courier = $delivery->courier;

        if (! $courier || ! $delivery->tracking_code) {
            return $delivery;
        }

        $integration = CourierManager::resolve($courier);

        if (! $integration) {
            return $delivery;
        }

        $result = $integration->trackOrder($delivery->tracking_code);

        if (($result['success'] ?? false) && ! empty($result['status'])) {
            $mapped = CourierStatusMapper::toDeliveryStatus($courier->type, $result['status']);

            if ($mapped !== $delivery->status) {
                $delivery->status = $mapped;
                $delivery->save();
            }
        }

        return $delivery;
    }

    public function delete(int $id): void
    {
        DB::transaction(fn () => $this->findScoped($id)->delete());
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $deliveries = $this->baseScopedQuery()->whereIn('deliveries.id', $ids)->get();
            $deliveries->each(fn (Delivery $delivery) => $delivery->delete());

            return $deliveries->count();
        });
    }

    /**
     * @return array{imported: int, failures: array<int, array<string, mixed>>}
     */
    public function import(UploadedFile $file): array
    {
        return ['imported' => 0, 'failures' => []];
    }
}
