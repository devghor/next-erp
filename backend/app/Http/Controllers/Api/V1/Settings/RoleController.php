<?php

namespace App\Http\Controllers\Api\V1\Settings;

use App\Exports\Settings\RolesExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Settings\BulkDeleteRoleRequest;
use App\Http\Requests\Api\V1\Settings\ImportRoleRequest;
use App\Http\Requests\Api\V1\Settings\StoreRoleRequest;
use App\Http\Requests\Api\V1\Settings\UpdateRoleRequest;
use App\Http\Resources\Api\V1\Settings\RoleResource;
use App\Services\Settings\RoleService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class RoleController extends Controller
{
    public function __construct(protected RoleService $roleService) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        return RoleResource::collection(
            $this->roleService->list($request->only(['id', 'name', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreRoleRequest $request): Response
    {
        return RoleResource::make($this->roleService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): RoleResource
    {
        return RoleResource::make($this->roleService->findScoped($id));
    }

    public function update(UpdateRoleRequest $request, int $id): RoleResource
    {
        return RoleResource::make($this->roleService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->roleService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteRoleRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->roleService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $roles = $this->roleService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Pdf::loadView('settings.roles', [
            'roles' => $roles,
            'company' => tenant(),
        ])->download('roles-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $roles = $this->roleService->forExport($request->only(['id', 'name', 'date_from', 'date_to']));

        return Excel::download(new RolesExport($roles), 'roles-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportRoleRequest $request): Response
    {
        return response()->json($this->roleService->import($request->file('file')));
    }
}
