<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barcode_settings', function (Blueprint $table) {
            $table->id();
            $table->uuid('company_id');
            $table->string('name');
            $table->text('description')->nullable();

            $table->decimal('width', 8, 2);
            $table->decimal('height', 8, 2);
            $table->decimal('paper_width', 8, 2)->nullable();
            $table->decimal('paper_height', 8, 2)->nullable();
            $table->decimal('top_margin', 8, 2)->default(0);
            $table->decimal('left_margin', 8, 2)->default(0);
            $table->decimal('row_distance', 8, 2)->default(0);
            $table->decimal('col_distance', 8, 2)->default(0);
            $table->unsignedInteger('stickers_in_one_row')->default(1);
            $table->unsignedInteger('stickers_in_one_sheet')->default(1);

            $table->boolean('is_default')->default(false);
            $table->timestamps();

            $table->index('company_id');
            $table->unique(['company_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barcode_settings');
    }
};
