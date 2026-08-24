<?php

namespace App\Services\Sale;

use App\Models\Sale\Challan;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface ChallanServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    public function findScoped(int $id): Challan;

    /**
     * @param  array{courier_id?: int|null, packing_slip_ids: array<int, int>}  $data
     */
    public function create(array $data): Challan;

    /**
     * @param  array{payments: array<int, array{challan_packing_slip_id: int, status: string, paid_amount?: float, delivery_charge?: float}>}  $data
     */
    public function finalize(int $id, array $data): Challan;

    /**
     * Packing slips with status 'pending' — feeds the create-form's picker.
     */
    public function availablePackingSlips(): Collection;
}
