<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('spare_parts', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('unit'); // pcs, liter, kg, meter
            $table->string('category')->nullable();
            $table->string('brand')->nullable();
            $table->string('part_number')->nullable();
            $table->integer('min_stock')->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->text('notes')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('inventory', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('spare_parts')->restrictOnDelete();
            $table->string('location')->default('gudang-utama');
            $table->decimal('qty_available', 10, 2)->default(0);
            $table->timestamps();

            $table->unique(['part_id', 'location']);
        });

        Schema::create('wo_parts_usage', function (Blueprint $table) {
            $table->id();
            $table->foreignId('wo_id')->constrained('work_orders')->cascadeOnDelete();
            $table->foreignId('part_id')->constrained('spare_parts')->restrictOnDelete();
            $table->decimal('qty_requested', 10, 2)->default(0);
            $table->decimal('qty_used', 10, 2)->default(0);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->timestamps();
        });

        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('part_id')->constrained('spare_parts')->restrictOnDelete();
            $table->enum('type', ['in', 'out', 'adjustment', 'return']);
            $table->decimal('qty', 10, 2);
            $table->decimal('unit_price', 15, 2)->default(0);
            $table->string('reference_type')->nullable(); // work_order, purchase
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->foreignId('processed_by')->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['part_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
        Schema::dropIfExists('wo_parts_usage');
        Schema::dropIfExists('inventory');
        Schema::dropIfExists('spare_parts');
    }
};
