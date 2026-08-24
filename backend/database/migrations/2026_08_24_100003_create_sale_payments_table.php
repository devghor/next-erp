<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('payment_reference');
            $table->foreignId('sale_id')->nullable()->constrained('sales')->cascadeOnDelete();

            // Cross-feature FKs — owning tables don't exist yet (built in a later phase) or
            // belong to a parallel fork this phase. Left as plain columns on purpose.
            $table->unsignedBigInteger('return_id')->nullable(); // -> sale_returns (Phase B)
            $table->unsignedBigInteger('installment_id')->nullable(); // -> sale_installments (Phase B)
            $table->unsignedBigInteger('gift_card_id')->nullable(); // -> gift_cards (parallel fork this phase)

            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('account_id')->nullable()->constrained('accounts')->nullOnDelete();

            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('change', 15, 2)->default(0);
            $table->string('paying_method')->default('Cash');
            $table->string('cheque_no')->nullable();
            $table->text('payment_note')->nullable();
            $table->timestamps();

            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_payments');
    }
};
