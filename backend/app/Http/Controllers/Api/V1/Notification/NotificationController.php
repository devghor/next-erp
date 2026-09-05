<?php

namespace App\Http\Controllers\Api\V1\Notification;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Resources\Api\V1\Notification\NotificationResource;
use App\Services\Notification\NotificationServiceInterface;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class NotificationController extends Controller implements HasMiddleware
{
    public function __construct(protected NotificationServiceInterface $notificationService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListNotifications->value, only: ['index', 'unreadCount']),
            new Middleware('permission:'.PermissionEnum::UpdateNotifications->value, only: ['markRead', 'markAllRead', 'runAction']),
            new Middleware('permission:'.PermissionEnum::DeleteNotifications->value, only: ['destroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return NotificationResource::collection(
            $this->notificationService->list($request->only(['status', 'page', 'per_page']))
        );
    }

    public function unreadCount(): Response
    {
        return response()->json(['count' => $this->notificationService->unreadCount()]);
    }

    public function markRead(int $id): NotificationResource
    {
        return NotificationResource::make($this->notificationService->markRead($id));
    }

    public function markAllRead(): Response
    {
        return response()->json(['updated' => $this->notificationService->markAllRead()]);
    }

    public function runAction(int $id, string $actionId): NotificationResource
    {
        return NotificationResource::make($this->notificationService->runAction($id, $actionId));
    }

    public function destroy(int $id): Response
    {
        $this->notificationService->delete($id);

        return response()->noContent();
    }
}
