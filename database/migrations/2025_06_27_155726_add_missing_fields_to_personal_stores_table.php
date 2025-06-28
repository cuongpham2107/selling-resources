<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('personal_stores', function (Blueprint $table) {
            $table->boolean('is_verified')->default(false)->after('is_active');
            $table->decimal('rating', 3, 2)->default(0.00)->after('lock_reason');
            $table->unsignedInteger('total_sales')->default(0)->after('rating');
            $table->unsignedInteger('total_products')->default(0)->after('total_sales');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('personal_stores', function (Blueprint $table) {
            $table->dropColumn(['is_verified', 'rating', 'total_sales', 'total_products']);
        });
    }
};
