<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_variants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained('products')->cascadeOnDelete();
            $table->foreignId('variant_id')->constrained('variants')->restrictOnDelete();
            $table->string('item_code');
            $table->decimal('additional_cost', 15, 2)->default(0);
            $table->decimal('additional_price', 15, 2)->default(0);
            $table->unsignedInteger('position')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['product_id', 'variant_id']);
            $table->unique('item_code');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_variants');
    }
};
