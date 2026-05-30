<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_menus', function (Blueprint $table) {
            $table->id();
            $table->string('menu_key')->unique();
            $table->string('label');
            $table->string('route')->nullable();
            $table->text('icon')->nullable();
            $table->foreignId('parent_id')->nullable()->constrained('app_menus')->nullOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('permission_prefix')->nullable();
            $table->string('required_permission')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_menus');
    }
};
