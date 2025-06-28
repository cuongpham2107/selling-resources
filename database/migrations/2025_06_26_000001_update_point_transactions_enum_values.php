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
            // Thay đổi enum để bao gồm tất cả giá trị hiện có
            $table->enum('type', [
                'earned', 
                'earn', 
                'referral_bonus', 
                'sent', 
                'received', 
                'exchanged',
                'spend',
                'transfer',
                'admin_adjust'
            ])->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('point_transactions', function (Blueprint $table) {
            // Rollback to original enum values
            $table->enum('type', ['earned', 'referral_bonus', 'sent', 'received', 'exchanged'])->change();
        });
    }
};
