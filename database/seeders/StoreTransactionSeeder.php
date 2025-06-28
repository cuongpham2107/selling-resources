<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StoreTransaction;

class StoreTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (StoreTransaction::count() > 0) {
            $this->command->info('StoreTransactions đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có StoreTransactions để seed');
    }
}
