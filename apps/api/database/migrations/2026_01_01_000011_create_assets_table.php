<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('assets', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->smallInteger('year')->nullable();
            $table->foreignId('category_id')->constrained('asset_categories')->restrictOnDelete();
            $table->enum('status', ['active', 'inactive', 'maintenance', 'breakdown'])->default('active');
            $table->decimal('current_hm', 10, 1)->default(0); // Hour Meter
            $table->decimal('current_km', 10, 1)->default(0); // Kilometer
            $table->string('qr_code')->unique()->nullable();
            $table->string('serial_number')->nullable();
            $table->string('plate_number')->nullable();
            $table->text('notes')->nullable();
            $table->string('photo')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('assets');
    }
};
