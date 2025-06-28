<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class SystemSettingsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xóa dữ liệu cũ nếu có
        DB::table('system_settings')->truncate();

        // Thêm dữ liệu cấu hình mặc định
        DB::table('system_settings')->insert([
            [
                'key' => 'point_to_vnd_rate',
                'value' => '500',
                'type' => 'integer',
                'description' => 'Tỷ giá quy đổi Point sang VNĐ (VNĐ/Point)',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'max_total_points',
                'value' => '50000000',
                'type' => 'integer',
                'description' => 'Tổng số Point tối đa có thể phát hành',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'general_chat_hourly_limit',
                'value' => '1',
                'type' => 'integer',
                'description' => 'Giới hạn tin nhắn chat tổng mỗi giờ',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'general_chat_daily_limit',
                'value' => '3',
                'type' => 'integer',
                'description' => 'Giới hạn tin nhắn chat tổng mỗi ngày',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'transaction_chat_daily_image_limit',
                'value' => '3',
                'type' => 'integer',
                'description' => 'Giới hạn ảnh chat giao dịch mỗi người mỗi ngày',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'max_products_per_upload',
                'value' => '5000',
                'type' => 'integer',
                'description' => 'Số sản phẩm tối đa mỗi lần tải lên',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'store_transaction_fee_percentage',
                'value' => '1',
                'type' => 'decimal',
                'description' => 'Phí giao dịch gian hàng (%)',
                'created_at' => now(),
                'updated_at' => now()
            ],
            [
                'key' => 'auto_complete_store_transaction_hours',
                'value' => '72',
                'type' => 'integer',
                'description' => 'Số giờ tự động hoàn thành giao dịch gian hàng',
                'created_at' => now(),
                'updated_at' => now()
            ]
        ]);

        $this->command->info('Đã seed ' . DB::table('system_settings')->count() . ' cài đặt hệ thống');
    }
}
