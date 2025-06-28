<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\DailyChatLimit;

class DailyChatLimitSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (DailyChatLimit::count() > 0) {
            $this->command->info('DailyChatLimits đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có DailyChatLimits để seed');
    }
}
