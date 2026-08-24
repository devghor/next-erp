<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->decimal('opening_balance', 15, 2)->default(0)->after('credit_limit');
            $table->decimal('deposit', 15, 2)->default(0)->after('opening_balance');
            $table->integer('points')->default(0)->after('deposit');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn(['opening_balance', 'deposit', 'points']);
        });
    }
};
