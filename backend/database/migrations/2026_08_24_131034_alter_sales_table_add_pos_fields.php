<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->boolean('is_pos')->default(false)->after('staff_note');
            $table->foreignId('cash_register_id')->nullable()->after('is_pos')->constrained('cash_registers')->nullOnDelete();
            $table->string('client_reference')->nullable()->after('cash_register_id');

            $table->unique(['company_id', 'client_reference']);
        });
    }

    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropUnique(['company_id', 'client_reference']);
            $table->dropConstrainedForeignId('cash_register_id');
            $table->dropColumn(['is_pos', 'client_reference']);
        });
    }
};
