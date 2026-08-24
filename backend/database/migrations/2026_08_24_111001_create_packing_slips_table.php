<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packing_slips', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('reference_no');
            $table->foreignId('sale_id')->constrained('sales')->restrictOnDelete();
            // Cross-fork: `deliveries` table is built in the same phase by a
            // different fork — left unconstrained deliberately, see plan rule 2.
            $table->unsignedBigInteger('delivery_id')->nullable();
            $table->decimal('amount', 15, 2)->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();

            $table->index('company_id');
            $table->index('delivery_id');
            $table->unique(['company_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packing_slips');
    }
};
