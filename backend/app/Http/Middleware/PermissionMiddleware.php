<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;

class PermissionMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        $user = $request->user();

        if (! $user) {
            throw new HttpException(401, 'Unauthenticated.');
        }

        if ($user->is_super_admin) {
            return $next($request);
        }

        $permissions = explode('|', $permission);

        if (! $user->hasAnyPermission($permissions)) {
            throw new HttpException(403, 'You do not have permission to perform this action.');
        }

        return $next($request);
    }
}
