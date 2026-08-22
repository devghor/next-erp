<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('units', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->foreignId('base_unit_id')->nullable()->constrained('units')->nullOnDelete();
            $table->string('code');
            $table->string('name');
            $table->string('operator')->default('*');
            $table->decimal('operation_value', 10, 4)->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'code']);
            $table->unique(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('units');
    }
};
