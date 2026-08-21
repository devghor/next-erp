<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\HttpFoundation\Response;

class SetPermissionsTeamId
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($tenant = tenant()) {
            app(PermissionRegistrar::class)->setPermissionsTeamId($tenant->getKey());
        }

        return $next($request);
    }
}
