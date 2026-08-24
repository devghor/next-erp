<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sale_payments', function (Blueprint $table) {
            $table->string('gateway_reference')->nullable()->after('payment_note');
            $table->string('gateway_status')->nullable()->after('gateway_reference');
        });
    }

    public function down(): void
    {
        Schema::table('sale_payments', function (Blueprint $table) {
            $table->dropColumn(['gateway_reference', 'gateway_status']);
        });
    }
};
