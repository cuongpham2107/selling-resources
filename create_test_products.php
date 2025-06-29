<?php

require_once 'vendor/autoload.php';

// Bootstrap Laravel application
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Models\Customer;
use App\Models\PersonalStore;
use App\Models\StoreProduct;

try {
    // Lấy customer đầu tiên
    $customer = Customer::first();
    if (!$customer) {
        echo "Không có customer nào trong database.\n";
        exit;
    }

    echo "Customer ID: {$customer->id} - Username: {$customer->username}\n";

    // Kiểm tra xem customer đã có store chưa
    $store = PersonalStore::where('owner_id', $customer->id)->first();
    if (!$store) {
        // Tạo personal store cho customer
        $store = PersonalStore::create([
            'owner_id' => $customer->id,
            'store_name' => 'Cửa hàng của ' . $customer->username,
            'description' => 'Cửa hàng bán các sản phẩm digital chất lượng',
            'is_active' => true,
            'is_verified' => true,
        ]);
        echo "Đã tạo store ID: {$store->id} - Tên: {$store->store_name}\n";
    } else {
        echo "Customer đã có store: {$store->store_name}\n";
    }

    // Tạo một số sản phẩm test
    $products = [
        [
            'name' => 'Tài khoản Netflix Premium',
            'description' => 'Tài khoản Netflix Premium 1 tháng, chất lượng 4K',
            'price' => 150000,
            'content' => 'Email: netflix@example.com\nPassword: 123456789\nHướng dẫn sử dụng...',
        ],
        [
            'name' => 'Game Steam Key - Cyberpunk 2077',
            'description' => 'Key game Cyberpunk 2077 cho Steam, hàng chính hãng',
            'price' => 500000,
            'content' => 'Steam Key: XXXX-XXXX-XXXX-XXXX\nHướng dẫn kích hoạt...',
        ],
        [
            'name' => 'Adobe Photoshop CC 2024',
            'description' => 'Phần mềm Adobe Photoshop CC 2024, bản quyền 1 năm',
            'price' => 800000,
            'content' => 'Download link: https://...\nSerial Key: XXXX-XXXX-XXXX-XXXX',
        ],
    ];

    foreach ($products as $productData) {
        // Kiểm tra xem sản phẩm đã tồn tại chưa
        $existingProduct = StoreProduct::where('store_id', $store->id)
            ->where('name', $productData['name'])
            ->first();
        
        if (!$existingProduct) {
            $product = StoreProduct::create([
                'store_id' => $store->id,
                'name' => $productData['name'],
                'description' => $productData['description'],
                'price' => $productData['price'],
                'content' => $productData['content'],
                'is_active' => true,
                'is_sold' => false,
                'is_deleted' => false,
            ]);
            echo "Đã tạo sản phẩm: {$product->name} - Giá: " . number_format($product->price) . " VND\n";
        } else {
            echo "Sản phẩm đã tồn tại: {$productData['name']}\n";
        }
    }

    echo "\nHoàn thành tạo test data!\n";
    echo "Customer {$customer->username} giờ đã có store và sản phẩm để test chức năng chat.\n";

} catch (Exception $e) {
    echo "Lỗi: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . "\n";
    echo "Line: " . $e->getLine() . "\n";
}
