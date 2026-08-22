<?php

namespace App\Services\Settings;

use App\Models\Settings\Role;
use App\Services\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface RoleServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection;

    /**
     * @param  array{name: string, permissions: array<int, string>}  $data
     */
    public function create(array $data): Role;

    public function findScoped(int $id): Role;

    /**
     * @param  array{name: string, permissions?: array<int, string>}  $data
     */
    public function update(int $id, array $data): Role;

    /**
     * @return array{imported: int, failures: array<int, array{row: int, attribute: string, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array;
}
