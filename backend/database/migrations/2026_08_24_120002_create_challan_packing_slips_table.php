<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('challan_packing_slips', function (Blueprint $table) {
            $table->id();
            $table->foreignId('challan_id')->constrained('challans')->cascadeOnDelete();
            $table->foreignId('packing_slip_id')->constrained('packing_slips')->restrictOnDelete();
            $table->decimal('amount', 15, 2)->default(0);
            $table->decimal('delivery_charge', 15, 2)->default(0);
            $table->string('status')->default('pending');
            $table->decimal('paid_amount', 15, 2)->default(0);
            $table->timestamps();

            $table->unique(['challan_id', 'packing_slip_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('challan_packing_slips');
    }
};
