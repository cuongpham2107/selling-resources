<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TransactionFeesSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ nếu có
        DB::table('transaction_fees')->truncate();

        // Thêm dữ liệu phí giao dịch theo bảng trong README
        DB::table('transaction_fees')->insert([
            [
                'min_amount' => 0,
                'max_amount' => 99999.99,
                'fee_amount' => 4000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 2,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 100000,
                'max_amount' => 199999.99,
                'fee_amount' => 6000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 3,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 200000,
                'max_amount' => 999999.99,
                'fee_amount' => 10000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 5,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 1000000,
                'max_amount' => 1999999.99,
                'fee_amount' => 16000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 8,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 2000000,
                'max_amount' => 4999999.99,
                'fee_amount' => 36000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 16,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 5000000,
                'max_amount' => 9999999.99,
                'fee_amount' => 66000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 32,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 10000000,
                'max_amount' => 29999999.99,
                'fee_amount' => 150000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 75,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'min_amount' => 30000000,
                'max_amount' => null,
                'fee_amount' => 300000,
                'fee_percentage' => 0,
                'daily_fee_percentage' => 20,
                'points_reward' => 150,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        $this->command->info('Đã seed ' . DB::table('transaction_fees')->count() . ' mức phí giao dịch');
    }
}
