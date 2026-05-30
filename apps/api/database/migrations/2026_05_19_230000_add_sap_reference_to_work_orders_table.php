<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table("work_orders", function (Blueprint $table) {
            $table->string("sap_reference_no")->nullable()->after("code")->index();
            $table->enum("wo_source", ["internal", "sap"])->default("internal")->after("sap_reference_no")->index();
        });
    }

    public function down(): void
    {
        Schema::table("work_orders", function (Blueprint $table) {
            $table->dropColumn(["sap_reference_no", "wo_source"]);
        });
    }
};
