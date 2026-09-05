<?php

namespace App\Services\Quotation;

use App\Models\Quotation\Quotation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

interface QuotationServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection;

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Quotation;

    public function findScoped(int $id): Quotation;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Quotation;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;

    public function sendMail(int $id): void;
}
