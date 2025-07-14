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
        // Xóa dữ liệu cũ và thêm phí mới theo bảng
        DB::table('transaction_fees')->truncate();
        
        DB::table('transaction_fees')->insert([
            [
                'min_amount' => 0,
                'max_amount' => 99999,
                'fee_amount' => 4000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 10,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 100000,
                'max_amount' => 199999,
                'fee_amount' => 6000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 15,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 200000,
                'max_amount' => 999999,
                'fee_amount' => 10000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 25,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 1000000,
                'max_amount' => 1999999,
                'fee_amount' => 16000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 40,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 2000000,
                'max_amount' => 4999999,
                'fee_amount' => 36000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 80,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 5000000,
                'max_amount' => 9999999,
                'fee_amount' => 66000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 150,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 10000000,
                'max_amount' => 29999999,
                'fee_amount' => 150000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 300,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'min_amount' => 30000000,
                'max_amount' => null, // Không giới hạn trên
                'fee_amount' => 300000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 500,
                'is_active' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Có thể khôi phục dữ liệu cũ nếu cần
    }
};
