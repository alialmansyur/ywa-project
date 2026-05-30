<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hm_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->decimal('hm_value', 10, 1)->default(0);
            $table->decimal('km_value', 10, 1)->default(0);
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->text('notes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();
            $table->timestamps();

            $table->index(['asset_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hm_logs');
    }
};
