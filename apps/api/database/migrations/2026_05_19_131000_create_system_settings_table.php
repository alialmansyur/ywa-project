<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("system_settings", function (Blueprint $table) {
            $table->id();
            $table->string("key")->unique();
            $table->string("label");
            $table->text("value_text")->nullable();
            $table->json("value_json")->nullable();
            $table->enum("type", ["string", "number", "boolean", "json", "email", "url", "select"])->default("string");
            $table->enum("scope", ["global", "module"])->default("global");
            $table->string("module_code")->nullable();
            $table->json("validation_rules")->nullable();
            $table->boolean("is_secret")->default(false);
            $table->boolean("is_editable")->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("system_settings");
    }
};
