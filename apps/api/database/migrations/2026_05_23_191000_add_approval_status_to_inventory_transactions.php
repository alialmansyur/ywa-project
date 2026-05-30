<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->enum('approval_status', ['not_required', 'pending_approval', 'approved', 'rejected'])
                ->default('not_required')
                ->after('notes');
            $table->timestamp('applied_at')->nullable()->after('approval_status');
        });
    }

    public function down(): void
    {
        Schema::table('inventory_transactions', function (Blueprint $table) {
            $table->dropColumn(['approval_status', 'applied_at']);
        });
    }
};
