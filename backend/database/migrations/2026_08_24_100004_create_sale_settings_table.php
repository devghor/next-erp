<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sale_settings', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->boolean('reward_points_active')->default(false);
            $table->decimal('per_point_amount', 15, 2)->default(0);
            $table->decimal('min_order_for_points', 15, 2)->default(0);
            $table->integer('point_expiry_days')->nullable();
            $table->unsignedBigInteger('default_account_id')->nullable();
            $table->timestamps();

            $table->unique('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('sale_settings');
    }
};
