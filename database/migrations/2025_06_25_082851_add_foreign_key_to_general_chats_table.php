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
        Schema::table('general_chats', function (Blueprint $table) {
            $table->foreign('attached_product_id')->references('id')->on('store_products')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('general_chats', function (Blueprint $table) {
            $table->dropForeign(['attached_product_id']);
        });
    }
};
