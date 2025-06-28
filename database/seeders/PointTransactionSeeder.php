<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PointTransaction;

class PointTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (PointTransaction::count() > 0) {
            $this->command->info('PointTransactions đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có PointTransactions để seed');
    }
}
