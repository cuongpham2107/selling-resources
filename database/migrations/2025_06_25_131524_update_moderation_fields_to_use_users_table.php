<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Cập nhật bảng personal_stores
        Schema::table('personal_stores', function (Blueprint $table) {
            // Drop foreign key cũ
            $table->dropForeign(['locked_by']);

            // Update foreign key để reference users table
            $table->foreign('locked_by')->references('id')->on('users')->onDelete('set null');
        });

        // Cập nhật bảng store_products  
        Schema::table('store_products', function (Blueprint $table) {
            // Drop foreign key cũ
            $table->dropForeign(['deleted_by']);

            // Update foreign key để reference users table
            $table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
        });

        // Cập nhật bảng general_chats
        Schema::table('general_chats', function (Blueprint $table) {
            // Drop foreign key cũ
            $table->dropForeign(['deleted_by']);

            // Update foreign key để reference users table
            $table->foreign('deleted_by')->references('id')->on('users')->onDelete('set null');
        });

        // Cập nhật bảng disputes
        Schema::table('disputes', function (Blueprint $table) {
            // Drop foreign key cũ
            $table->dropForeign(['assigned_to']);

            // Update foreign key để reference users table
            $table->foreign('assigned_to')->references('id')->on('users')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert về customers table
        Schema::table('personal_stores', function (Blueprint $table) {
            $table->dropForeign(['locked_by']);
            $table->foreign('locked_by')->references('id')->on('customers')->onDelete('set null');
        });

        Schema::table('store_products', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->foreign('deleted_by')->references('id')->on('customers')->onDelete('set null');
        });

        Schema::table('general_chats', function (Blueprint $table) {
            $table->dropForeign(['deleted_by']);
            $table->foreign('deleted_by')->references('id')->on('customers')->onDelete('set null');
        });

        Schema::table('disputes', function (Blueprint $table) {
            $table->dropForeign(['assigned_to']);
            $table->foreign('assigned_to')->references('id')->on('customers')->onDelete('set null');
        });
    }
};
