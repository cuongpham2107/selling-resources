<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\PersonalStore;
use App\Models\Customer;

class PersonalStoreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();
        
        if ($customers->count() == 0) {
            $this->command->warn('Không có customers để tạo stores. Chạy CustomerSeeder trước.');
            return;
        }

        // Kiểm tra xem đã có stores chưa
        if (PersonalStore::count() > 0) {
            $this->command->info('Stores đã tồn tại, bỏ qua tạo stores mới');
            return;
        }

        // Tạo stores cho 2 customers đầu tiên
        $storeData = [
            [
                'owner_id' => $customers->first()->id,
                'store_name' => 'Cửa hàng điện tử ABC',
                'description' => 'Chuyên bán các sản phẩm điện tử, điện thoại, laptop chính hãng với giá tốt nhất thị trường.',
                'is_active' => true,
                'is_verified' => true,
                'rating' => 4.5,
                'total_sales' => rand(5000000, 50000000), // 5M-50M VND
                'total_products' => rand(10, 50),
            ],
            [
                'owner_id' => $customers->skip(1)->first()->id,
                'store_name' => 'Thời trang XYZ',
                'description' => 'Cửa hàng thời trang nam nữ, quần áo, phụ kiện thời trang cao cấp.',
                'is_active' => true,
                'is_verified' => false,
                'rating' => 3.8,
                'total_sales' => rand(2000000, 20000000), // 2M-20M VND
                'total_products' => rand(5, 30),
            ],
        ];

        foreach ($storeData as $data) {
            PersonalStore::create($data);
        }

        $this->command->info('Đã tạo ' . count($storeData) . ' personal stores test');
    }
}
