<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_installments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('installment_plan_id')->constrained('sale_installment_plans')->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->date('payment_date');
            $table->decimal('amount', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_installments');
    }
};
