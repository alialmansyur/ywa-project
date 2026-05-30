<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('app_menu_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained('app_menus')->cascadeOnDelete();
            $table->string('service_key')->unique();
            $table->string('label');
            $table->string('http_method', 10)->nullable();
            $table->string('endpoint')->nullable();
            $table->string('permission_name')->nullable();
            $table->unsignedInteger('sort_order')->default(1);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['menu_id', 'is_active']);
            $table->index('permission_name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('app_menu_services');
    }
};
