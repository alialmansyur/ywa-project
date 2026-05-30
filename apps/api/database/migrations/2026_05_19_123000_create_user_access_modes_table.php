<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("user_access_modes", function (Blueprint $table) {
            $table->foreignId("user_id")->primary()->constrained("users")->cascadeOnDelete();
            $table->enum("access_mode", ["role", "custom"])->default("role");
            $table->text("notes")->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("user_access_modes");
    }
};
