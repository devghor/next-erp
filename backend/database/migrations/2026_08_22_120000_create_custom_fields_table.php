<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_fields', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('belongs_to');
            $table->string('name');
            $table->string('type');
            $table->json('options')->nullable();
            $table->boolean('is_table')->default(false);
            $table->boolean('is_required')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'belongs_to', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_fields');
    }
};
