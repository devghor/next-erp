<?php

namespace App\Services\Settings;

use App\Models\Settings\CustomField;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface CustomFieldServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    /**
     * @param  array{belongs_to: string, name: string, type: string, options?: array<int, string>|null, is_table?: bool, is_required?: bool}  $data
     */
    public function create(array $data): CustomField;

    public function findScoped(int $id): CustomField;

    /**
     * @param  array{belongs_to: string, name: string, type: string, options?: array<int, string>|null, is_table?: bool, is_required?: bool}  $data
     */
    public function update(int $id, array $data): CustomField;

    public function delete(int $id): void;

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int;
}
