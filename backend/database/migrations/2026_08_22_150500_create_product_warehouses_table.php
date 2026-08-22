<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->nullable()->constrained('product_variants')->cascadeOnDelete();
            $table->foreignId('batch_id')->nullable()->constrained('product_batches')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->decimal('qty', 15, 4)->default(0);
            $table->decimal('price', 15, 2)->nullable();
            $table->timestamps();

            $table->unique(['product_id', 'variant_id', 'batch_id', 'warehouse_id'], 'product_warehouses_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_warehouses');
    }
};
