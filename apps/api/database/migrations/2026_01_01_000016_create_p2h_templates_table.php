<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('p2h_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('asset_category_id')->constrained('asset_categories')->restrictOnDelete();
            $table->json('items'); // [{group, item_name, type: checkbox|text|number}]
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2h_templates');
    }
};
