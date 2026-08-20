<?php

namespace App\Models\Setting\Company;

use App\Models\User;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'company_user', 'company_id', 'user_id');
    }
}
