<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('reference_no');
            $table->foreignId('customer_id')->constrained('customers')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('warehouses')->restrictOnDelete();
            $table->foreignId('biller_id')->nullable()->constrained('billers')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('currency_id')->nullable()->constrained('currencies')->nullOnDelete();
            $table->decimal('exchange_rate', 15, 4)->default(1);

            $table->integer('item')->default(0);
            $table->decimal('total_qty', 15, 4)->default(0);
            $table->decimal('total_discount', 15, 2)->default(0);
            $table->decimal('total_tax', 15, 2)->default(0);
            $table->decimal('total_price', 15, 2)->default(0);
            $table->decimal('order_tax_rate', 5, 2)->nullable();
            $table->decimal('order_tax', 15, 2)->default(0);
            $table->string('order_discount_type')->default('fixed'); // fixed, percentage
            $table->decimal('order_discount_value', 15, 2)->default(0);
            $table->decimal('order_discount', 15, 2)->default(0);

            // Cross-feature (Coupons is built in a parallel fork this phase) — left unconstrained on purpose.
            $table->unsignedBigInteger('coupon_id')->nullable();
            $table->decimal('coupon_discount', 15, 2)->default(0);

            $table->decimal('shipping_cost', 15, 2)->default(0);
            $table->decimal('grand_total', 15, 2)->default(0);
            $table->decimal('paid_amount', 15, 2)->default(0);

            $table->string('sale_status')->default('draft'); // draft, completed
            $table->string('payment_status')->default('due'); // due, partial, paid

            $table->integer('pay_term_no')->nullable();
            $table->string('pay_term_period')->nullable(); // days, months
            $table->date('due_date')->nullable();

            $table->string('document')->nullable();
            $table->text('sale_note')->nullable();
            $table->text('staff_note')->nullable();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

            $table->timestamps();
            $table->softDeletes();

            $table->index('company_id');
            $table->unique(['company_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sales');
    }
};
