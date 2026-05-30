<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create("smtp_configurations", function (Blueprint $table) {
            $table->id();
            $table->string("name");
            $table->string("host");
            $table->unsignedSmallInteger("port");
            $table->string("username")->nullable();
            $table->text("password_encrypted")->nullable();
            $table->enum("encryption", ["none", "ssl", "tls"])->default("tls");
            $table->string("from_name");
            $table->string("from_email");
            $table->boolean("is_enabled")->default(false);
            $table->boolean("is_default")->default(false);
            $table->timestamp("last_test_at")->nullable();
            $table->enum("last_test_status", ["success", "failed"])->nullable();
            $table->foreignId("created_by")->nullable()->constrained("users")->nullOnDelete();
            $table->foreignId("updated_by")->nullable()->constrained("users")->nullOnDelete();
            $table->timestamps();
        });

        Schema::create("smtp_test_email_logs", function (Blueprint $table) {
            $table->id();
            $table->foreignId("smtp_configuration_id")->constrained("smtp_configurations")->cascadeOnDelete();
            $table->string("to_email");
            $table->enum("status", ["success", "failed"]);
            $table->text("error_message")->nullable();
            $table->timestamp("sent_at");
            $table->foreignId("created_by")->nullable()->constrained("users")->nullOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists("smtp_test_email_logs");
        Schema::dropIfExists("smtp_configurations");
    }
};
