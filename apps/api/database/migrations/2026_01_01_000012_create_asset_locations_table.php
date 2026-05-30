<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->decimal('lat', 10, 8);
            $table->decimal('lng', 11, 8);
            $table->string('address')->nullable();
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->timestamps();

            $table->index(['asset_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_locations');
    }
};
