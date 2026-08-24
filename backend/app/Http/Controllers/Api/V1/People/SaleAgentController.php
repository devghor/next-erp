<?php

namespace App\Http\Controllers\Api\V1\People;

use App\Enums\Settings\PermissionEnum;
use App\Exports\People\SaleAgentsExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\People\BulkDeleteSaleAgentRequest;
use App\Http\Requests\Api\V1\People\ImportSaleAgentRequest;
use App\Http\Requests\Api\V1\People\StoreSaleAgentRequest;
use App\Http\Requests\Api\V1\People\UpdateSaleAgentRequest;
use App\Http\Resources\Api\V1\People\SaleAgentResource;
use App\Services\People\SaleAgentServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class SaleAgentController extends Controller implements HasMiddleware
{
    public function __construct(protected SaleAgentServiceInterface $saleAgentService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListPeopleSaleAgents->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreatePeopleSaleAgents->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadPeopleSaleAgents->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdatePeopleSaleAgents->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeletePeopleSaleAgents->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return SaleAgentResource::collection(
            $this->saleAgentService->list($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreSaleAgentRequest $request): Response
    {
        return SaleAgentResource::make($this->saleAgentService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): SaleAgentResource
    {
        return SaleAgentResource::make($this->saleAgentService->findScoped($id));
    }

    public function update(UpdateSaleAgentRequest $request, int $id): SaleAgentResource
    {
        return SaleAgentResource::make($this->saleAgentService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->saleAgentService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteSaleAgentRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->saleAgentService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $saleAgents = $this->saleAgentService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Pdf::loadView('people.sale_agents', [
            'saleAgents' => $saleAgents,
            'company' => tenant(),
        ])->download('sale-agents-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $saleAgents = $this->saleAgentService->forExport($request->only(['id', 'name', 'phone', 'email', 'address', 'date_from', 'date_to']));

        return Excel::download(new SaleAgentsExport($saleAgents), 'sale-agents-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportSaleAgentRequest $request): Response
    {
        return response()->json($this->saleAgentService->import($request->file('file')));
    }
}
