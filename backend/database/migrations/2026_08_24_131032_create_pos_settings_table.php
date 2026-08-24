<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pos_settings', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->foreignId('warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('biller_id')->nullable()->constrained('billers')->nullOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();

            $table->integer('product_number')->default(25);
            $table->boolean('keyboard_active')->default(false);
            $table->boolean('cash_register_active')->default(false);
            $table->boolean('show_print_invoice')->default(true);
            $table->boolean('play_sound')->default(true);
            $table->json('payment_options')->nullable();
            $table->string('invoice_option')->nullable();
            $table->string('thermal_invoice_size')->default('80mm'); // 58mm, 80mm

            // Payment gateway credentials — a gateway's payment button only renders
            // once its keys are non-empty, same as salespro's behavior.
            $table->string('stripe_public_key')->nullable();
            $table->string('stripe_secret_key')->nullable();
            $table->string('razorpay_key_id')->nullable();
            $table->string('razorpay_key_secret')->nullable();
            $table->string('mpesa_consumer_key')->nullable();
            $table->string('mpesa_consumer_secret')->nullable();
            $table->string('mpesa_shortcode')->nullable();
            $table->string('mpesa_passkey')->nullable();
            $table->string('mtnmomo_subscription_key')->nullable();
            $table->string('mtnmomo_api_user')->nullable();
            $table->string('mtnmomo_api_key')->nullable();
            $table->string('mtnmomo_target_environment')->nullable();
            $table->string('payhere_merchant_id')->nullable();
            $table->string('payhere_merchant_secret')->nullable();

            $table->timestamps();

            $table->unique('company_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pos_settings');
    }
};
