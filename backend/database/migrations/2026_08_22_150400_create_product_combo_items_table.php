<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_combo_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('combo_product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('component_product_id')->constrained('products')->restrictOnDelete();
            $table->foreignId('component_variant_id')->nullable()->constrained('product_variants')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->decimal('qty', 15, 4)->default(1);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->decimal('wastage_percent', 5, 2)->default(0);
            $table->timestamps();

            $table->index(['combo_product_id']);
            $table->index(['component_product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_combo_items');
    }
};
