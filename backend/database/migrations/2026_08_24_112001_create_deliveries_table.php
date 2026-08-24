<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('reference_no');
            $table->foreignId('sale_id')->constrained('sales')->restrictOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained('couriers')->nullOnDelete();

            $table->text('address')->nullable();
            $table->string('tracking_code')->nullable();
            $table->string('delivered_by')->nullable();
            $table->string('recieved_by')->nullable();
            $table->string('file')->nullable();
            $table->text('note')->nullable();
            $table->string('status')->default('packing'); // packing, delivering, delivered

            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'reference_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
