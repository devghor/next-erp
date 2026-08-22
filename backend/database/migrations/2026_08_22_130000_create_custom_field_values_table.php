<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_field_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('custom_field_id')->constrained('custom_fields')->cascadeOnDelete();
            $table->unsignedBigInteger('product_id');
            $table->text('value')->nullable();
            $table->timestamps();

            $table->index('product_id');
            $table->unique(['custom_field_id', 'product_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_field_values');
    }
};
