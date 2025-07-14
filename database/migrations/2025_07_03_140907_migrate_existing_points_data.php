<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Transfer existing points data to the new columns
        DB::table('customer_points')->update([
            'available_points' => DB::raw('points'),
            'total_earned' => DB::raw('points'),
            'total_spent' => 0
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reset the new columns
        DB::table('customer_points')->update([
            'available_points' => 0,
            'total_earned' => 0,
            'total_spent' => 0
        ]);
    }
};
