<?php

namespace App\Http\Controllers\Api\V1\Web\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\Web\Auth\LoginRequest;
use App\Http\Resources\Api\V1\Web\Auth\UserResource;
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

        $token = $user->createToken('auth_token')->plainTextToken;

        return UserResource::make($user)
            ->additional([
                'meta' => [
                    'access_token' => $token,
                    'token_type' => 'Bearer',
                ],
            ]);
    }
}
