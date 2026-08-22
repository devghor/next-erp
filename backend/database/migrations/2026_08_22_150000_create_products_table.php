<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->foreignId('category_id')->constrained('categories')->restrictOnDelete();
            $table->foreignId('brand_id')->nullable()->constrained('brands')->nullOnDelete();
            $table->foreignId('unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('purchase_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('sale_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->foreignId('tax_id')->nullable()->constrained('taxes')->nullOnDelete();

            $table->string('name');
            $table->string('code');
            $table->string('type')->default('standard'); // standard, combo, digital, service

            $table->decimal('cost', 15, 2)->default(0);
            $table->decimal('price', 15, 2)->default(0);
            $table->decimal('wholesale_price', 15, 2)->nullable();
            $table->decimal('min_wholesale_qty', 15, 4)->nullable();

            $table->unsignedTinyInteger('tax_method')->default(1); // 1 exclusive, 2 inclusive
            $table->decimal('alert_quantity', 15, 4)->default(0);

            $table->boolean('has_warranty')->default(false);
            $table->unsignedInteger('warranty_value')->nullable();
            $table->string('warranty_type')->nullable(); // days, months, years

            $table->boolean('has_guarantee')->default(false);
            $table->unsignedInteger('guarantee_value')->nullable();
            $table->string('guarantee_type')->nullable();

            $table->date('starting_date')->nullable();
            $table->date('last_date')->nullable();

            $table->boolean('is_variant')->default(false);
            $table->boolean('is_imei')->default(false);
            $table->boolean('is_batch')->default(false);
            $table->boolean('is_recipe')->default(false);

            $table->json('variant_option')->nullable();
            $table->json('variant_value')->nullable();

            $table->decimal('wastage_percent', 5, 2)->nullable();
            $table->decimal('profit_margin', 5, 2)->nullable();

            $table->text('product_details')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
