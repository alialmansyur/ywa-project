<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'sqlite') {
            Schema::table('p2h_templates', function (Blueprint $table) {
                $table->unsignedBigInteger('asset_category_id')->nullable()->change();
            });
        } else {
            DB::statement('ALTER TABLE p2h_templates MODIFY asset_category_id BIGINT UNSIGNED NULL');
        }

        Schema::table('p2h_templates', function (Blueprint $table) {
            $table->boolean('applies_to_all_assets')->default(false)->after('items');
            $table->unsignedInteger('version')->default(1)->after('applies_to_all_assets');
            $table->date('effective_from')->nullable()->after('version');
            $table->date('effective_to')->nullable()->after('effective_from');
            $table->text('change_notes')->nullable()->after('effective_to');

            $table->foreignId('created_by')->nullable()->after('change_notes')->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->after('created_by')->constrained('users')->nullOnDelete();

            $table->index(['is_active', 'applies_to_all_assets']);
            $table->index(['effective_from', 'effective_to']);
        });

        Schema::table('p2h_submissions', function (Blueprint $table) {
            $table->date('submission_date')->nullable()->after('submitted_at');
            $table->unsignedInteger('template_version')->default(1)->after('template_id');

            $table->unique(['asset_id', 'operator_id', 'submission_date'], 'p2h_daily_asset_operator_unique');
        });
    }

    public function down(): void
    {
        Schema::table('p2h_submissions', function (Blueprint $table) {
            $table->dropUnique('p2h_daily_asset_operator_unique');
            $table->dropColumn(['submission_date', 'template_version']);
        });

        Schema::table('p2h_templates', function (Blueprint $table) {
            $table->dropConstrainedForeignId('updated_by');
            $table->dropConstrainedForeignId('created_by');
            $table->dropIndex(['is_active', 'applies_to_all_assets']);
            $table->dropIndex(['effective_from', 'effective_to']);
            $table->dropColumn([
                'applies_to_all_assets',
                'version',
                'effective_from',
                'effective_to',
                'change_notes',
            ]);
        });

        if (DB::getDriverName() === 'sqlite') {
            Schema::table('p2h_templates', function (Blueprint $table) {
                $table->unsignedBigInteger('asset_category_id')->nullable(false)->change();
            });
        } else {
            DB::statement('ALTER TABLE p2h_templates MODIFY asset_category_id BIGINT UNSIGNED NOT NULL');
        }
    }
};
