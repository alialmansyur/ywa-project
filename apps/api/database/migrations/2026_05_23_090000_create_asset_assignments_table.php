<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('asset_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamp('assigned_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['asset_id', 'released_at']);
            $table->index(['user_id', 'released_at']);
            $table->unique(['asset_id', 'user_id', 'released_at'], 'asset_user_release_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_assignments');
    }
};

