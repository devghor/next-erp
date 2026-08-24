<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_exchanges', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->foreignId('sale_id')->nullable()->constrained('sales')->nullOnDelete();
            $table->string('reference_no');
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('biller_id')->nullable()->constrained('billers')->nullOnDelete();

            $table->integer('item')->default(0);
            $table->decimal('total_qty', 15, 4)->default(0);
            $table->decimal('total_discount', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('payment_type')->nullable(); // pay, receive
            $table->decimal('order_tax_rate', 5, 2)->nullable();
            $table->decimal('order_tax', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);

            $table->string('document')->nullable();
            $table->text('exchange_note')->nullable();
            $table->text('staff_note')->nullable();

            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_exchanges');
    }
};
