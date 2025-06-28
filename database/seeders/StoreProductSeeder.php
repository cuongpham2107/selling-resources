<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\StoreProduct;
use App\Models\PersonalStore;

class StoreProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Kiểm tra xem đã có data chưa
        if (StoreProduct::count() > 0) {
            $this->command->info('StoreProducts đã tồn tại, bỏ qua tạo mới');
            return;
        }
        
        $stores = PersonalStore::all();
        if ($stores->count() == 0) {
            $this->command->warn('Không có stores để tạo products');
            return;
        }
        
        // Tạo một vài sản phẩm mẫu cho mỗi store
        $productCount = 0;
        foreach ($stores as $store) {
            $products = [
                [
                    'store_id' => $store->id,
                    'name' => 'Sản phẩm mẫu 1 - ' . $store->store_name,
                    'description' => 'Mô tả sản phẩm test',
                    'price' => rand(50000, 500000), // 50k-500k VND
                    'content' => 'Nội dung chi tiết sản phẩm test',
                    'is_active' => true,
                ],
                [
                    'store_id' => $store->id,
                    'name' => 'Sản phẩm mẫu 2 - ' . $store->store_name,
                    'description' => 'Mô tả sản phẩm test số 2',
                    'price' => rand(50000, 500000), // 50k-500k VND
                    'content' => 'Nội dung chi tiết sản phẩm test số 2',
                    'is_active' => true,
                ],
            ];
            
            foreach ($products as $product) {
                StoreProduct::create($product);
                $productCount++;
            }
        }
        
        $this->command->info("Đã tạo {$productCount} store products test");
    }
}
