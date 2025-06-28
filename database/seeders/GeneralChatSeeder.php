<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\GeneralChat;

class GeneralChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (GeneralChat::count() > 0) {
            $this->command->info('GeneralChats đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có GeneralChats để seed');
    }
}
