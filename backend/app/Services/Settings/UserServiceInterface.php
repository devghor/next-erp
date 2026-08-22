<?php

namespace App\Services\Settings;

use App\Models\User;
use App\Services\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

interface UserServiceInterface extends BaseServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection;

    /**
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function create(array $data): User;

    public function findScoped(int $id): User;

    /**
     * @param  array{name: string, email: string, password?: string|null}  $data
     */
    public function update(int $id, array $data): User;

    /**
     * @return array{imported: int, failures: array<int, array{row: int, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array;
}
