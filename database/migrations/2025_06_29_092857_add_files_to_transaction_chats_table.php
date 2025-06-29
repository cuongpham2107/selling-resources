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
        Schema::table('transaction_chats', function (Blueprint $table) {
            // Check if files column doesn't exist before adding it
            if (!Schema::hasColumn('transaction_chats', 'files')) {
                $table->json('files')->nullable()->after('images')->comment('Array các đường dẫn file đính kèm');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('transaction_chats', function (Blueprint $table) {
            // Remove files column if it exists
            if (Schema::hasColumn('transaction_chats', 'files')) {
                $table->dropColumn('files');
            }
        });
    }
};
