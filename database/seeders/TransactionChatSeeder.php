<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\TransactionChat;

class TransactionChatSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (TransactionChat::count() > 0) {
            $this->command->info('TransactionChats đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có TransactionChats để seed');
    }
}
