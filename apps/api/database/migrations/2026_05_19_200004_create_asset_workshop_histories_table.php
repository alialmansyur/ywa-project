<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_workshop_histories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->string('reference_no')->nullable();
            $table->enum('category', ['preventive', 'corrective', 'breakdown', 'refurbish'])->default('corrective');
            $table->date('date_in')->nullable();
            $table->date('date_out')->nullable();
            $table->string('issue')->nullable();
            $table->text('action_taken')->nullable();
            $table->decimal('cost', 14, 2)->default(0);
            $table->unsignedInteger('downtime_hours')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_workshop_histories');
    }
};
