<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchases', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('reference_no');
            $table->foreignId('supplier_id')->nullable()->constrained('suppliers')->nullOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();

            $table->string('status')->default('received'); // pending, received
            $table->string('payment_status')->default('due'); // paid, partial, due

            $table->decimal('total_qty', 15, 4)->default(0);
            $table->decimal('total_discount', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('total_cost', 15, 2)->default(0);
            $table->decimal('order_tax', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);

            $table->text('note')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index('company_id');
            $table->unique(['company_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('purchases');
    }
};
