<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Referral;

class ReferralSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (Referral::count() > 0) {
            $this->command->info('Referrals đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $this->command->info('Không có Referrals để seed');
    }
}
