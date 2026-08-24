<?php

namespace App\Services\Sale;

use App\Models\Sale\Sale;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface SaleServiceInterface
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
    public function create(array $data): Sale;

    public function findScoped(int $id): Sale;

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(int $id, array $data): Sale;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;

    /**
     * @param  array<string, mixed>  $data
     */
    public function addPayment(int $id, array $data): Sale;

    /**
     * @param  array{customer_id: int, warehouse_id: int, biller_id?: int|null, currency_id?: int|null, sale_status?: string}  $meta
     */
    public function importCsv(UploadedFile $file, array $meta): Sale;
}
