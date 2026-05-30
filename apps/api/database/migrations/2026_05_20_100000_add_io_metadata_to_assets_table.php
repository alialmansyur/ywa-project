<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->string('company_code', 20)->nullable()->after('model');
            $table->string('plant_code', 20)->nullable()->after('company_code');
            $table->string('engine_number')->nullable()->after('serial_number');
            $table->string('sap_asset_no', 100)->nullable()->after('engine_number');
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['company_code', 'plant_code', 'engine_number', 'sap_asset_no']);
        });
    }
};
