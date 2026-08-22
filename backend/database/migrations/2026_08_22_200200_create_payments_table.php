<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('payment_reference');
            $table->foreignId('purchase_id')->nullable()->constrained('purchases')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('account_id')->nullable();

            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('change', 15, 2)->default(0);
            $table->string('paying_method')->default('Cash');
            $table->timestamps();

            $table->index('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
