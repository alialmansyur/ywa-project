<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('p2h_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('submission_id')->constrained('p2h_submissions')->cascadeOnDelete();
            $table->string('group')->nullable();
            $table->string('item_name');
            $table->enum('condition', ['ok', 'not_ok', 'na'])->default('ok');
            $table->text('notes')->nullable();
            $table->string('photo_url')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('p2h_items');
    }
};
