<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Dispute;

class DisputeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (Dispute::count() > 0) {
            $this->command->info('Disputes đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có Disputes để seed');
    }
}
