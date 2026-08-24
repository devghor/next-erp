<?php

namespace App\Services\Sale;

use App\Imports\Sale\CouponsImport;
use App\Models\Sale\Coupon;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Maatwebsite\Excel\Facades\Excel;

class CouponService implements CouponServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Coupon::query()->where('company_id', $this->activeCompany()->id);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(coupons.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['code'] ?? null, fn (Builder $query, string $code) => $query->where('coupons.code', 'like', "%{$code}%"))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('coupons.type', $type))
            ->when($filters['is_active'] ?? null, fn (Builder $query, string $isActive) => $query->where('coupons.is_active', $isActive === '1' || $isActive === 'true'))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('coupons.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('coupons.created_at', '<=', $date));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('coupons.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('coupons.created_at')
            ->get();
    }

    /**
     * @param  array{code: string, name?: string|null, type: string, amount: float, minimum_amount?: float, quantity: int, expired_date: string}  $data
     */
    public function create(array $data): Coupon
    {
        return DB::transaction(function () use ($data) {
            if (($data['type'] ?? 'fixed') === 'percentage') {
                $data['minimum_amount'] = 0;
            }

            return Coupon::create([
                ...$data,
                'company_id' => $this->activeCompany()->id,
                'user_id' => auth()->id(),
                'used' => 0,
                'is_active' => true,
            ]);
        });
    }

    public function findScoped(int $id): Coupon
    {
        return $this->baseScopedQuery()->where('coupons.id', $id)->firstOrFail();
    }

    /**
     * @param  array{code: string, name?: string|null, type: string, amount: float, minimum_amount?: float, quantity: int, expired_date: string}  $data
     */
    public function update(int $id, array $data): Coupon
    {
        return DB::transaction(function () use ($id, $data) {
            $coupon = $this->findScoped($id);

            // Fixed-amount coupons are the only type with a minimum-spend gate.
            if (($data['type'] ?? $coupon->type) === 'percentage') {
                $data['minimum_amount'] = 0;
            }

            $coupon->fill($data);
            $coupon->save();

            return $coupon;
        });
    }

    public function delete(int $id): void
    {
        // Soft "delete" — coupons are never hard-deleted so historical sales
        // that reference a coupon_id keep a resolvable (if inactive) record.
        DB::transaction(function () use ($id) {
            $coupon = $this->findScoped($id);
            $coupon->is_active = false;
            $coupon->save();
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            return $this->baseScopedQuery()->whereIn('coupons.id', $ids)->update(['is_active' => false]);
        });
    }

    public function generateCode(): string
    {
        do {
            $code = Str::upper(Str::random(10));
        } while ($this->baseScopedQuery()->where('code', $code)->exists());

        return $code;
    }

    /**
     * @return array{valid: bool, discount: float, message: ?string}
     */
    public function validateForSale(Coupon $coupon, float $grandTotal): array
    {
        if (! $coupon->is_active) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Coupon is not active.'];
        }

        if ($coupon->quantity > 0 && $coupon->used >= $coupon->quantity) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Coupon is no longer available.'];
        }

        if ($coupon->expired_date && $coupon->expired_date->isPast()) {
            return ['valid' => false, 'discount' => 0, 'message' => 'Coupon has expired.'];
        }

        if ($coupon->type === 'fixed') {
            if ($grandTotal < (float) $coupon->minimum_amount) {
                return ['valid' => false, 'discount' => 0, 'message' => 'Order does not meet the minimum amount for this coupon.'];
            }

            return ['valid' => true, 'discount' => (float) $coupon->amount, 'message' => null];
        }

        return ['valid' => true, 'discount' => round($grandTotal * ((float) $coupon->amount / 100), 2), 'message' => null];
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new CouponsImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
