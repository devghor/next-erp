<?php

namespace App\Models\Setting\Company;

use Stancl\Tenancy\Database\Models\Tenant as BaseTenant;

class Company extends BaseTenant
{
    protected $table = 'companies';

    public static function getCustomColumns(): array
    {
        return [
            'id',
            'name',
            'short_name',
            'code',
            'address',
            'plan',
        ];
    }
}
