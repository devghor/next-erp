<?php

namespace App\Http\Controllers\Api\V1\People;

use App\Enums\Settings\PermissionEnum;
use App\Exports\People\CustomersExport;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\People\BulkDeleteCustomerRequest;
use App\Http\Requests\Api\V1\People\ImportCustomerRequest;
use App\Http\Requests\Api\V1\People\StoreCustomerRequest;
use App\Http\Requests\Api\V1\People\UpdateCustomerRequest;
use App\Http\Resources\Api\V1\People\CustomerResource;
use App\Services\People\CustomerServiceInterface;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\Response;

class CustomerController extends Controller implements HasMiddleware
{
    public function __construct(protected CustomerServiceInterface $customerService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ListPeopleCustomers->value, only: ['index', 'exportPdf', 'exportExcel']),
            new Middleware('permission:'.PermissionEnum::CreatePeopleCustomers->value, only: ['store', 'import']),
            new Middleware('permission:'.PermissionEnum::ReadPeopleCustomers->value, only: ['show']),
            new Middleware('permission:'.PermissionEnum::UpdatePeopleCustomers->value, only: ['update']),
            new Middleware('permission:'.PermissionEnum::DeletePeopleCustomers->value, only: ['destroy', 'bulkDestroy']),
        ];
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        return CustomerResource::collection(
            $this->customerService->list($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'tax_number', 'date_from', 'date_to', 'per_page']))
        );
    }

    public function store(StoreCustomerRequest $request): Response
    {
        return CustomerResource::make($this->customerService->create($request->validated()))
            ->response()
            ->setStatusCode(201);
    }

    public function show(int $id): CustomerResource
    {
        return CustomerResource::make($this->customerService->findScoped($id));
    }

    public function update(UpdateCustomerRequest $request, int $id): CustomerResource
    {
        return CustomerResource::make($this->customerService->update($id, $request->validated()));
    }

    public function destroy(int $id): Response
    {
        $this->customerService->delete($id);

        return response()->noContent();
    }

    public function bulkDestroy(BulkDeleteCustomerRequest $request): Response
    {
        return response()->json([
            'deleted' => $this->customerService->bulkDelete($request->validated()['ids']),
        ]);
    }

    public function exportPdf(Request $request): Response
    {
        $customers = $this->customerService->forExport($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'tax_number', 'date_from', 'date_to']));

        return Pdf::loadView('people.customers', [
            'customers' => $customers,
            'company' => tenant(),
        ])->download('customers-'.now()->format('Y-m-d').'.pdf');
    }

    public function exportExcel(Request $request): BinaryFileResponse
    {
        $customers = $this->customerService->forExport($request->only(['id', 'name', 'company_name', 'phone', 'email', 'address', 'city', 'state', 'postal_code', 'country', 'tax_number', 'date_from', 'date_to']));

        return Excel::download(new CustomersExport($customers), 'customers-'.now()->format('Y-m-d').'.xlsx');
    }

    public function import(ImportCustomerRequest $request): Response
    {
        return response()->json($this->customerService->import($request->file('file')));
    }
}
