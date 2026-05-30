<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('app_menus', function (Blueprint $table) {
            if (!Schema::hasColumn('app_menus', 'platform')) {
                $table->string('platform', 20)->nullable()->after('route')->index();
            }
        });
    }

    public function down(): void
    {
        Schema::table('app_menus', function (Blueprint $table) {
            if (Schema::hasColumn('app_menus', 'platform')) {
                $table->dropColumn('platform');
            }
        });
    }
};

