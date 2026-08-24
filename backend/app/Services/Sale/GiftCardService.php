<?php

namespace App\Services\Sale;

use App\Models\Sale\GiftCard;
use App\Models\Sale\GiftCardRecharge;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class GiftCardService implements GiftCardServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return GiftCard::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->with(['customer', 'user'])
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(gift_cards.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['card_no'] ?? null, fn (Builder $query, string $cardNo) => $query->where('gift_cards.card_no', 'like', "%{$cardNo}%"))
            ->when($filters['customer_id'] ?? null, fn (Builder $query, string $customerId) => $query->where('gift_cards.customer_id', $customerId))
            ->when($filters['is_active'] ?? null, fn (Builder $query, string $isActive) => $query->where('gift_cards.is_active', (bool) $isActive))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('gift_cards.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('gift_cards.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('gift_cards.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('gift_cards.created_at')
            ->get();
    }

    /**
     * @param  array{card_no: string, customer_id?: int|null, user_id?: int|null, amount?: float, expired_date?: string|null}  $data
     */
    public function create(array $data): GiftCard
    {
        return DB::transaction(fn () => GiftCard::create([
            ...$data,
            'company_id' => $this->activeCompany()->id,
            'expense' => 0,
            'is_active' => true,
        ]));
    }

    public function findScoped(int $id): GiftCard
    {
        return $this->baseScopedQuery()->where('gift_cards.id', $id)->firstOrFail();
    }

    /**
     * @param  array{card_no: string, customer_id?: int|null, user_id?: int|null, amount?: float, expired_date?: string|null}  $data
     */
    public function update(int $id, array $data): GiftCard
    {
        return DB::transaction(function () use ($id, $data) {
            $giftCard = $this->findScoped($id);
            $giftCard->fill($data);
            $giftCard->save();

            return $giftCard;
        });
    }

    public function recharge(int $id, float $amount, ?int $userId): GiftCard
    {
        return DB::transaction(function () use ($id, $amount, $userId) {
            $giftCard = $this->findScoped($id);
            $giftCard->amount = (float) $giftCard->amount + $amount;
            $giftCard->save();

            GiftCardRecharge::create([
                'gift_card_id' => $giftCard->id,
                'amount' => $amount,
                'user_id' => $userId,
            ]);

            return $giftCard->fresh();
        });
    }

    /**
     * Soft-deactivates rather than hard-deletes, matching gift card lifecycle
     * where a used/expired card must remain visible in payment history.
     */
    public function delete(int $id): void
    {
        DB::transaction(fn () => $this->findScoped($id)->update(['is_active' => false]));
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $giftCards = $this->baseScopedQuery()->whereIn('gift_cards.id', $ids)->get();
            $giftCards->each(fn (GiftCard $giftCard) => $giftCard->update(['is_active' => false]));

            return $giftCards->count();
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
