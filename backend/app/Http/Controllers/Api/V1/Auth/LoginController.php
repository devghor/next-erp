<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\Settings\PermissionEnum;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Resources\Api\V1\Auth\UserResource;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(LoginRequest $request)
    {
        $credentials = $request->validated();

        if (! Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var User $user */
        $user = Auth::user();
        $user->load('companies');

        $token = $user->createToken('auth_token')->plainTextToken;

        $companyId = $user->companies->first()->id ?? null;
        if ($companyId) {
            setPermissionsTeamId($companyId);
        }

        return UserResource::make($user)
            ->additional([
                'meta' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                    'permissions' => $user->is_super_admin ? PermissionEnum::cases() : $user->getAllPermissions()->pluck('name'),
                ],
            ]);
    }

    public function authUser()
    {
        /** @var User $user */
        $user = Auth::user();
        $user->load('companies');
        $user->load('permissions');

        return UserResource::make($user);
    }
}
