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
        // Cập nhật default value cho cột status trong bảng store_transactions
        Schema::table('store_transactions', function (Blueprint $table) {
            $table->string('status')->default(\App\States\StoreTransaction\PendingState::class)->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('store_transactions', function (Blueprint $table) {
            $table->string('status')->default(\App\States\StoreTransaction\ProcessingState::class)->change();
        });
    }
};
