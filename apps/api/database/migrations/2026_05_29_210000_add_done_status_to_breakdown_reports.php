<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("\n            ALTER TABLE breakdown_reports\n            MODIFY COLUMN status ENUM('submitted', 'in_review', 'processed', 'done', 'cancelled')\n            DEFAULT 'submitted'\n        ");
    }

    public function down(): void
    {
        DB::statement("\n            ALTER TABLE breakdown_reports\n            MODIFY COLUMN status ENUM('submitted', 'in_review', 'processed', 'cancelled')\n            DEFAULT 'submitted'\n        ");
    }
};
