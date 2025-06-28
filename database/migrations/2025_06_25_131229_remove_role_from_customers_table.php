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
        Schema::table('customers', function (Blueprint $table) {
            // Xóa index liên quan đến role trước
            $table->dropIndex(['role', 'is_active']);
            
            // Xóa trường role
            $table->dropColumn('role');
            
            // Tạo lại index chỉ với is_active
            $table->index('is_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            // Thêm lại trường role
            $table->enum('role', ['admin', 'support_admin', 'moderator_transaction', 'moderator_store', 'reviewer', 'user'])->default('user')->after('phone');
            
            // Xóa index cũ và tạo lại index composite
            $table->dropIndex(['is_active']);
            $table->index(['role', 'is_active']);
        });
    }
};
