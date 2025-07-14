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
            // Add new columns for point tracking
            $table->integer('available_points')->default(0)->after('points');
            $table->integer('total_earned')->default(0)->after('available_points');
            $table->integer('total_spent')->default(0)->after('total_earned');
            
            // Migrate existing points data to available_points
            // This will be handled in a separate data migration
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customer_points', function (Blueprint $table) {
            $table->dropColumn(['available_points', 'total_earned', 'total_spent']);
        });
    }
};
