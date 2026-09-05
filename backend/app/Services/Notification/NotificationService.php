<?php

namespace App\Services\Notification;

use App\Models\Notification\Notification;
use App\Models\Settings\Company;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class NotificationService implements NotificationServiceInterface
{
    protected function activeCompany(): Company
    {
        /** @var Company $company */
        $company = tenant();

        return $company;
    }

    protected function baseScopedQuery(): Builder
    {
        return Notification::query()
            ->where('company_id', $this->activeCompany()->id)
            ->where('user_id', auth()->id());
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    protected function filteredQuery(array $filters): Builder
    {
        $status = $filters['status'] ?? 'all';

        return $this->baseScopedQuery()
            ->when($status !== 'all', fn (Builder $query) => $query->where('status', $status));
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator
    {
        return $this->filteredQuery($filters)
            ->orderByDesc('created_at')
            ->paginate($filters['per_page'] ?? 20)
            ->withQueryString();
    }

    public function unreadCount(): int
    {
        return $this->baseScopedQuery()->where('status', 'unread')->count();
    }

    public function findScoped(int $id): Notification
    {
        return $this->baseScopedQuery()->where('id', $id)->firstOrFail();
    }

    public function markRead(int $id): Notification
    {
        $notification = $this->findScoped($id);
        $notification->status = 'read';
        $notification->save();

        return $notification;
    }

    public function markAllRead(): int
    {
        return $this->baseScopedQuery()->where('status', 'unread')->update(['status' => 'read']);
    }

    public function runAction(int $id, string $actionId): Notification
    {
        $notification = $this->findScoped($id);
        $actions = $notification->actions ?? [];

        $found = false;
        foreach ($actions as &$action) {
            if (($action['id'] ?? null) === $actionId) {
                $action['executed'] = true;
                $found = true;
            }
        }
        unset($action);

        abort_unless($found, 404);

        $notification->actions = $actions;

        if ($notification->status === 'unread') {
            $notification->status = 'read';
        }

        $notification->save();

        return $notification;
    }

    public function delete(int $id): void
    {
        $this->findScoped($id)->delete();
    }
}
