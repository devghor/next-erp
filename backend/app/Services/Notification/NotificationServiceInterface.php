<?php

namespace App\Services\Notification;

use App\Models\Notification\Notification;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

interface NotificationServiceInterface
{
    /**
     * @param  array<string, mixed>  $filters
     */
    public function list(array $filters): LengthAwarePaginator;

    public function unreadCount(): int;

    public function findScoped(int $id): Notification;

    public function markRead(int $id): Notification;

    public function markAllRead(): int;

    public function runAction(int $id, string $actionId): Notification;

    public function delete(int $id): void;
}
