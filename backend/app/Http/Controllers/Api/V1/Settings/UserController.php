<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Enums\Settings\PermissionEnum;
use App\Exports\Settings\UsersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteUserRequest;
use App\Http\Requests\Api\V1\Settings\ImportUserRequest;
use App\Http\Requests\Api\V1\Settings\StoreUserRequest;
use App\Http\Requests\Api\V1\Settings\UpdateUserRequest;
use App\Http\Resources\Api\V1\Settings\UserResource;
use App\Services\Settings\UserServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class UserController extends Controller implements HasMiddleware
{
    public function __construct(protected UserServiceInterface $userService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListSettingsUsers->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreateSettingsUsers->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadSettingsUsers->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdateSettingsUsers->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeleteSettingsUsers->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return UserResource::collection(
            $this->userService->list($request->only(['id', 'name', 'email', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreUserRequest $request): Response
    {
        return UserResource::make($this->userService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): UserResource
    {
        return UserResource::make($this->userService->findScoped($id));
    }

    public function update(UpdateUserRequest $request, int $id): UserResource
    {
        return UserResource::make($this->userService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->userService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteUserRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->userService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $users = $this->userService->forExport($request->only(['id', 'name', 'email', 'date_from', 'date_to']));

        return Pdf::loadView('settings.users', [
            'users' => $users,
            'company' => tenant(),
        ])->download('users-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $users = $this->userService->forExport($request->only(['id', 'name', 'email', 'date_from', 'date_to']));

        return Excel::download(new UsersExport($users), 'users-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportUserRequest $request): Response
    {
        return response()->json($this->userService->import($request->file('file')));
    }
}
