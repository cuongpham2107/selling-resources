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
        Schema::table('customer_points', function (Blueprint $table) {
            // Sửa cột points từ decimal thành integer vì C là số nguyên
            $table->integer('points')->default(0)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_points', function (Blueprint $table) {
            $table->decimal('points', 15, 2)->default(0)->change();
        });
    }
};
