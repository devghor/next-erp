<?php

namespace App\Http\Controllers\Api\V1\Sale;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Sale\CloseCashRegisterRequest;
use App\Http\Requests\Api\V1\Sale\OpenCashRegisterRequest;
use App\Models\Sale\CashRegister;
use App\Services\Sale\CashRegisterServiceInterface;
use Illuminate\Routing\Controllers\HasMiddleware;
use Illuminate\Routing\Controllers\Middleware;
use Symfony\Component\HttpFoundation\Response;

class CashRegisterController extends Controller implements HasMiddleware
{
    public function __construct(protected CashRegisterServiceInterface $cashRegisterService) {}

    public static function middleware(): array
    {
        return [
            new Middleware('permission:'.PermissionEnum::ManageSaleCashRegister->value),
        ];
    }

    public function availability(int $warehouse): ?CashRegister
    {
        return $this->cashRegisterService->checkAvailability($warehouse);
    }

    public function open(OpenCashRegisterRequest $request): Response
    {
        return response()->json($this->cashRegisterService->open($request->validated()), 201);
    }

    public function close(CloseCashRegisterRequest $request, int $id): CashRegister
    {
        return $this->cashRegisterService->close($id, $request->validated());
    }

    public function show(int $id): CashRegister
    {
        return $this->cashRegisterService->details($id);
    }
}
