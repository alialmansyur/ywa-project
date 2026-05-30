<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->string('jobcard_no')->nullable()->after('wo_source')->index();
            $table->enum('jobcard_status', ['draft', 'generated', 'printed', 'acknowledged'])
                ->default('draft')
                ->after('jobcard_no')
                ->index();
            $table->timestamp('jobcard_generated_at')->nullable()->after('jobcard_status');
            $table->timestamp('jobcard_printed_at')->nullable()->after('jobcard_generated_at');
            $table->timestamp('jobcard_acknowledged_at')->nullable()->after('jobcard_printed_at');
        });
    }

    public function down(): void
    {
        Schema::table('work_orders', function (Blueprint $table) {
            $table->dropColumn([
                'jobcard_no',
                'jobcard_status',
                'jobcard_generated_at',
                'jobcard_printed_at',
                'jobcard_acknowledged_at',
            ]);
        });
    }
};
