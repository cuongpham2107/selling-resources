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
        Schema::table('point_transactions', function (Blueprint $table) {
            // Sửa cột amount từ decimal thành integer vì C là số nguyên
            $table->integer('amount')->change();
            $table->integer('balance_after')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            $table->decimal('amount', 15, 2)->change();
            $table->decimal('balance_after', 15, 2)->change();
        });
    }
};
