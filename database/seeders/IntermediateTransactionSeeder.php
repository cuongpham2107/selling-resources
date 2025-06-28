<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\IntermediateTransaction;

class IntermediateTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (IntermediateTransaction::count() > 0) {
            $this->command->info('IntermediateTransactions đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có IntermediateTransactions để seed');
    }
}
