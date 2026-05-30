<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            if (!Schema::hasColumn('assets', 'io_code')) {
                $table->string('io_code', 100)->nullable()->after('code');
            }
            if (!Schema::hasColumn('assets', 'plant')) {
                $table->string('plant', 50)->nullable()->after('plant_code');
            }
            if (!Schema::hasColumn('assets', 'veh_plate_no')) {
                $table->string('veh_plate_no', 100)->nullable()->after('plate_number');
            }
            if (!Schema::hasColumn('assets', 'chasis_no')) {
                $table->string('chasis_no', 100)->nullable()->after('serial_number');
            }
            if (!Schema::hasColumn('assets', 'engine_no')) {
                $table->string('engine_no', 100)->nullable()->after('engine_number');
            }
            if (!Schema::hasColumn('assets', 'asset_no')) {
                $table->string('asset_no', 100)->nullable()->after('sap_asset_no');
            }
        });
    }

    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $drop = [];
            foreach (['io_code', 'plant', 'veh_plate_no', 'chasis_no', 'engine_no', 'asset_no'] as $column) {
                if (Schema::hasColumn('assets', $column)) {
                    $drop[] = $column;
                }
            }

            if ($drop !== []) {
                $table->dropColumn($drop);
            }
        });
    }
};
