<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_installment_plans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->unique()->constrained('sales')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('price', 15, 2);
            $table->decimal('additional_amount', 15, 2)->default(0);
            $table->decimal('total_amount', 15, 2);
            $table->decimal('down_payment', 15, 2)->default(0);
            $table->integer('months');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_installment_plans');
    }
};
