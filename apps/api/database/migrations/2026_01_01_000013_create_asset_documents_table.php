<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('asset_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained()->cascadeOnDelete();
            $table->enum('type', ['stnk', 'bpkb', 'kir', 'insurance', 'other']);
            $table->string('file_path');
            $table->string('document_number')->nullable();
            $table->date('issued_at')->nullable();
            $table->date('expired_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('asset_documents');
    }
};
