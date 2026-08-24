<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_return_products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_id')->constrained('sale_returns')->cascadeOnDelete();
            $table->foreignId('product_sale_id')->nullable()->constrained('product_sales')->nullOnDelete();
            $table->foreignId('product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained('product_batches')->nullOnDelete();
            $table->foreignId('sale_unit_id')->nullable()->constrained('units')->nullOnDelete();

            $table->decimal('qty', 15, 4);
            $table->decimal('net_unit_price', 15, 2);
            $table->decimal('discount', 15, 2)->default(0);
            $table->decimal('tax_rate', 5, 2)->default(0);
            $table->decimal('tax', 15, 2)->default(0);
            $table->decimal('total', 15, 2);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_return_products');
    }
};
