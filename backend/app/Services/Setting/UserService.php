<?php

namespace App\Services\Setting;

use App\Imports\Setting\UsersImport;
use App\Models\Setting\Company\Company;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Maatwebsite\Excel\Facades\Excel;

class UserService
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('users.created_at')
            ->paginate($filters['per_page'] ?? 10)
            ->withQueryString();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function forExport(array $filters): Collection
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('users.created_at')
            ->get();
    }

    /**
     * The pivot-joined query for the active company's users, pre-qualified
     * to select only `users.*` — without this, `SELECT *` across the join
     * lets `company_user`'s own `id`/`created_at`/`updated_at` columns
     * silently clobber the user's during row hydration.
     */
    protected function baseScopedQuery(): Builder
    {
        return $this->activeCompany()->users()->getQuery()->select('users.*');
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        return $this->baseScopedQuery()
            ->when($filters['id'] ?? null, fn (Builder $query, string $id) => $query->whereRaw('CAST(users.id AS VARCHAR) LIKE ?', ["%{$id}%"]))
            ->when($filters['name'] ?? null, fn (Builder $query, string $name) => $query->where('users.name', 'like', "%{$name}%"))
            ->when($filters['email'] ?? null, fn (Builder $query, string $email) => $query->where('users.email', 'like', "%{$email}%"))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('users.created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('users.created_at', '<=', $date));
    }

    /**
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            $this->activeCompany()->users()->syncWithoutDetaching([$user->id]);

            return $user;
        });
    }

    public function findScoped(int $id): User
    {
        return $this->baseScopedQuery()->where('users.id', $id)->firstOrFail();
    }

    /**
     * @param  array{name: string, email: string, password?: string|null}  $data
     */
    public function update(int $id, array $data): User
    {
        $user = $this->findScoped($id);
        $user->fill(Arr::only($data, ['name', 'email']));

        if (! empty($data['password'])) {
            $user->password = Hash::make($data['password']);
        }

        $user->save();

        return $user;
    }

    public function delete(int $id): void
    {
        DB::transaction(function () use ($id) {
            $this->deleteScoped($this->findScoped($id));
        });
    }

    /**
     * @param  array<int, int>  $ids
     */
    public function bulkDelete(array $ids): int
    {
        return DB::transaction(function () use ($ids) {
            $users = $this->baseScopedQuery()->whereIn('users.id', $ids)->get();

            foreach ($users as $user) {
                $this->deleteScoped($user);
            }

            return $users->count();
        });
    }

    protected function deleteScoped(User $user): void
    {
        $this->activeCompany()->users()->detach($user->id);

        if ($user->companies()->count() === 0) {
            $user->delete();
        }
    }

    /**
     * @return array{imported: int, failures: array<int, array{row: int, errors: array<int, string>}>}
     */
    public function import(UploadedFile $file): array
    {
        $import = new UsersImport($this->activeCompany());

        Excel::import($import, $file);

        return [
            'imported' => $import->importedCount(),
            'failures' => $import->failuresArray(),
        ];
    }
}
