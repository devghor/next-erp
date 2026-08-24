<?php

namespace App\Services\Sale;

use App\Models\Sale\CashRegister;
use App\Models\Sale\Payment;
use App\Models\Settings\Company;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashRegisterService implements CashRegisterServiceInterface
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
        return CashRegister::query()->where('company_id', $this->activeCompany()->id);
    }

    protected function findScoped(int $id): CashRegister
    {
        return $this->baseScopedQuery()->where('id', $id)->firstOrFail();
    }

    public function checkAvailability(int $warehouseId): ?CashRegister
    {
        return $this->baseScopedQuery()
            ->where('warehouse_id', $warehouseId)
            ->where('user_id', $this->currentUserId())
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function open(array $data): CashRegister
    {
        return DB::transaction(function () use ($data) {
            if ($this->checkAvailability((int) $data['warehouse_id'])) {
                throw ValidationException::withMessages([
                    'warehouse_id' => 'A cash register is already open for this warehouse.',
                ]);
            }

            return CashRegister::create([
                'company_id' => $this->activeCompany()->id,
                'warehouse_id' => $data['warehouse_id'],
                'user_id' => $this->currentUserId(),
                'opening_amount' => $data['opening_amount'] ?? 0,
                'status' => 'open',
                'note' => $data['note'] ?? null,
                'opened_at' => now(),
            ]);
        });
    }

    /**
     * expected_amount = opening_amount + sum of cash-method sale_payments recorded
     * against sales tied to this register session.
     *
     * @param  array<string, mixed>  $data
     */
    public function close(int $id, array $data): CashRegister
    {
        return DB::transaction(function () use ($id, $data) {
            $register = $this->findScoped($id);

            if ($register->status === 'closed') {
                throw ValidationException::withMessages([
                    'id' => 'This cash register is already closed.',
                ]);
            }

            $cashPayments = (float) Payment::query()
                ->where('paying_method', 'Cash')
                ->whereHas('sale', fn (Builder $query) => $query->where('cash_register_id', $register->id))
                ->sum('amount');

            $register->update([
                'closing_amount' => $data['closing_amount'] ?? null,
                'expected_amount' => (float) $register->opening_amount + $cashPayments,
                'status' => 'closed',
                'note' => $data['note'] ?? $register->note,
                'closed_at' => now(),
            ]);

            return $register->fresh();
        });
    }

    public function details(int $id): CashRegister
    {
        return $this->findScoped($id);
    }
}
