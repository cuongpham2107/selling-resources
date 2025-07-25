<?php

namespace App\Http\Controllers\Customer;

use App\Models\StoreProduct;
use App\Models\PersonalStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class MarketplaceController extends BaseCustomerController
{
    /**
     * Display all available products from all stores
     * 
     * Hiển thị tất cả sản phẩm có sẵn từ tất cả cửa hàng
     * Logic: Lấy sản phẩm từ tất cả store active, loại trừ store của chính user, hỗ trợ filter và search
     */
    public function index(Request $request): Response
    {
        $customer = $this->getCustomer(); // Lấy thông tin customer hiện tại
        // Xây dựng query cơ bản: lấy sản phẩm có sẵn từ các store hoạt động
        $query = StoreProduct::query()
            ->with(['store:id,store_name,rating,is_verified'])
            ->whereHas('store', function ($q) use ($customer) {
                $q->where('is_active', true)  // Store phải đang hoạt động
                  ->where('is_locked', false); // Store không bị khóa
                  
                // Loại trừ store của chính customer (không hiển thị sản phẩm của mình)
                if ($customer && $customer->personalStore) {
                    $q->where('id', '!=', $customer->personalStore->id);
                }
            })
            ->where('is_active', true)   // Sản phẩm phải đang active
            ->where('is_sold', false)    // Sản phẩm chưa được bán
            ->where('is_deleted', false); // Sản phẩm chưa bị xóa

        // Tính năng tìm kiếm theo tên và mô tả sản phẩm
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filter theo danh mục (có thể mở rộng sau)
        if ($request->filled('category')) {
            // Add category filtering logic here
        }

        // Filter theo khoảng giá
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Filter theo store cụ thể
        if ($request->filled('store_id')) {
            $query->where('store_id', $request->get('store_id'));
        }

        // Sắp xếp kết quả theo nhiều tiêu chí
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc'); // Giá thấp đến cao
                break;
            case 'price_high':
                $query->orderBy('price', 'desc'); // Giá cao đến thấp
                break;
            case 'name':
                $query->orderBy('name', 'asc'); // Theo tên A-Z
                break;
            case 'popular':
                // Sắp xếp theo độ phổ biến (số lần bán)
                $query->withCount(['transactions as sales_count' => function ($q) {
                    $q->where('status', 'completed');
                }])->orderBy('sales_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc'); // Mới nhất trước
        }

        // Phân trang kết quả (4 sản phẩm/trang) và giữ lại query parameters
        $products = $query->paginate(4)->withQueryString();

        // Tính toán thống kê marketplace (loại trừ store của customer)
        $stats = [
            'total_products' => StoreProduct::available()->fromActiveStores()
                ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                    $q->where('store_id', '!=', $customer->personalStore->id);
                })
                ->count(),
            'total_stores' => PersonalStore::where('is_active', true)
                ->where('is_locked', false)
                ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                    $q->where('id', '!=', $customer->personalStore->id);
                })
                ->count(),
            'featured_stores' => PersonalStore::where('is_active', true)
                ->where('is_verified', true) // Store đã được verify
                ->where('is_locked', false)
                ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                    $q->where('id', '!=', $customer->personalStore->id);
                })
                ->orderBy('rating', 'desc') // Sắp xếp theo rating cao nhất
                ->limit(6)
                ->get(['id', 'store_name', 'rating', 'avatar']),
        ];

        // Lấy danh sách store phổ biến để làm filter (loại trừ store của customer)
        $popularStores = PersonalStore::where('is_active', true)
            ->where('is_locked', false)
            ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                $q->where('id', '!=', $customer->personalStore->id);
            })
            ->orderBy('total_sales', 'desc') // Sắp xếp theo số lượng bán
            ->limit(10)
            ->get(['id', 'store_name']);
        return Inertia::render('customer/Marketplace/Index', [
            'products' => $products,
            'stats' => $stats,
            'popularStores' => $popularStores,
            'filters' => [
                'search' => $request->get('search', ''),
                'min_price' => $request->get('min_price', ''),
                'max_price' => $request->get('max_price', ''),
                'store_id' => $request->get('store_id', ''),
                'sort' => $request->get('sort', 'created_at'),
            ]
        ]);
    }

    /**
     * Show a specific product detail
     * 
     * Hiển thị chi tiết sản phẩm cụ thể
     */
    public function show(StoreProduct $product): Response
    {
        // Check if product is available
        if (!$product->isAvailable() || !$product->store->is_active || $product->store->is_locked) {
            abort(404, 'Sản phẩm không có sẵn.');
        }

        $product->load([
            'store:id,owner_id,store_name,description,rating,is_verified,total_sales,total_products',
            'transactions' => function ($query) {
                $query->where('status', 'completed')
                    ->with('buyer:id,username')
                    ->latest()
                    ->limit(5);
            }
        ]);

        // Get related products from the same store
        $relatedProducts = StoreProduct::where('store_id', $product->store_id)
            ->where('id', '!=', $product->id)
            ->available()
            ->limit(4)
            ->get(['id', 'name', 'price', 'images']);

        // Get similar products from other stores
        $similarProducts = StoreProduct::where('store_id', '!=', $product->store_id)
            ->available()
            ->fromActiveStores()
            ->where('price', '>=', $product->price * 0.8)
            ->where('price', '<=', $product->price * 1.2)
            ->limit(4)
            ->get(['id', 'name', 'price', 'images', 'store_id']);

        // Product analytics for display
        $analytics = [
            'total_sales' => $product->transactions()
                ->where('status', 'completed')
                ->sum('amount'),
            'total_orders' => $product->transactions()
                ->where('status', 'completed')
                ->count(),
            'recent_sales' => $product->transactions()
                ->where('status', 'completed')
                ->latest()
                ->limit(5)
                ->get(),
        ];

        return Inertia::render('customer/Marketplace/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
            'similarProducts' => $similarProducts,
            'currentUser' => $this->customer->load('balance')->append('available_balance_computed'),
            'analytics' => $analytics,
        ]);
    }

    /**
     * Show products from a specific store
     * 
     * Hiển thị sản phẩm từ một cửa hàng cụ thể
     */
    public function store(PersonalStore $store, Request $request): Response
    {
        // Check if store is active
        if (!$store->is_active || $store->is_locked) {
            abort(404, 'Cửa hàng không có sẵn.');
        }

        $query = $store->products()
            ->available()
            ->with(['transactions' => function ($q) {
                $q->where('status', 'completed');
            }]);

        // Search within store
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        switch ($sortBy) {
            case 'price_low':
                $query->orderBy('price', 'asc');
                break;
            case 'price_high':
                $query->orderBy('price', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(16)->withQueryString();

        // Store statistics
        $storeStats = [
            'total_products' => $store->activeProducts()->count(),
            'total_sales' => $store->transactions()
                ->where('status', 'completed')
                ->sum('amount'),
            'total_orders' => $store->transactions()
                ->where('status', 'completed')
                ->count(),
            'member_since' => $store->created_at,
        ];

        return Inertia::render('customer/Marketplace/StoreDetail', [
            'store' => $store,
            'products' => $products,
            'storeStats' => $storeStats,
            'filters' => [
                'search' => $request->get('search', ''),
                'min_price' => $request->get('min_price', ''),
                'max_price' => $request->get('max_price', ''),
                'sort' => $request->get('sort', 'created_at'),
            ]
        ]);
    }

    /**
     * Purchase a product
     * 
     * Mua một sản phẩm từ marketplace
     * Logic: Kiểm tra tính hợp lệ → Tạo StoreTransaction → Trừ tiền buyer → Đánh dấu sản phẩm đã bán
     */
    public function purchase(Request $request, StoreProduct $product)
    {
       
        // Bước 1: Kiểm tra tính khả dụng của sản phẩm
        if (!$product->is_active || $product->is_sold || $product->is_deleted) {
            return back()->withErrors(['message' => 'Sản phẩm không còn khả dụng.']);
        }

        // Bước 2: Kiểm tra trạng thái store
        if (!$product->store->is_active || $product->store->is_locked) {
            return back()->withErrors(['message' => 'Cửa hàng không hoạt động.']);
        }

        // Bước 3: Kiểm tra không thể tự mua sản phẩm của mình
        if ($product->store->owner_id === $this->customer->id) {
            return back()->withErrors(['message' => 'Không thể mua sản phẩm của chính mình.']);
        }

        // Bước 4: Kiểm tra số dư ví đủ để mua
        if (!$this->customer->balance->hasEnoughBalance($product->price)) {
            return back()->withErrors(['message' => 'Số dư ví không đủ để thực hiện giao dịch.']);
        }

        // Bước 5: Tạo mã giao dịch unique theo format XXXX-XXXX-XXXX-XXXX
        do {
            $transactionCode = strtoupper(bin2hex(random_bytes(8)));
            $transactionCode = substr($transactionCode, 0, 4) . '-' .
                               substr($transactionCode, 4, 4) . '-' .
                               substr($transactionCode, 8, 4) . '-' .
                               substr($transactionCode, 12, 4);
        
        } while (\App\Models\StoreTransaction::where('transaction_code', $transactionCode)->exists());
        // try {
            // Bước 6: Bắt đầu database transaction để đảm bảo tính nhất quán
            DB::beginTransaction();

            // Bước 7: Tạo store transaction với trạng thái PENDING (chờ xác nhận từ người bán)
            $transaction = \App\Models\StoreTransaction::create([
                'transaction_code' => $transactionCode,
                'buyer_id' => $this->customer->id,
                'seller_id' => $product->store->owner_id,
                'product_id' => $product->id,
                'amount' => $product->price,
                'fee' => $product->price * 0.01, // Phí 1% cho store transaction
                'status' => \App\States\StoreTransaction\PendingState::class,
                
            ]);

            // Bước 8: Đặt thời gian tự động hoàn thành (mặc định 72 giờ)
            $transaction->setAutoCompleteTime();
            // Bước 9: Trừ tiền từ số dư của buyer
            if (!$this->customer->balance->deductBalance($product->price)) {
                throw new \Exception('Không thể trừ tiền từ số dư.');
            }
            // Nếu trừ tiền thành công, tăng locked_balance lên
            $this->customer->balance->increment('locked_balance', $product->price);


            
            // Bước 10: Đánh dấu sản phẩm đã được bán
            $product->update(['is_sold' => true]);
           
            // Bước 11: Tạo bản ghi wallet transaction để tracking
            \App\Models\WalletTransaction::create([
                'customer_id' => $this->customer->id,
                'type' => 'buy', // Trừ tiền
                'transaction_type' => 'store_purchase',
                'amount' => $product->price,
                'fee' => $transaction->fee,
                'description' => "Mua sản phẩm: {$product->name}",
                'reference_id' => $transaction->id,
                'status' => 'processing',
                'processed_at' => now(),
                'completed_at' => now(),
            ]);

            // Bước 12: Commit transaction nếu tất cả thành công
            DB::commit();

            return redirect()->route('customer.store.transactions.show', $transaction)
                ->with('success', 'Đã mua sản phẩm thành công! Giao dịch sẽ tự động hoàn thành sau 72 giờ.');

        // } catch (\Exception $e) {
        //     // Bước 13: Rollback nếu có lỗi xảy ra
        //     DB::rollback();
        //     return back()->withErrors(['message' => 'Có lỗi xảy ra khi xử lý giao dịch. Vui lòng thử lại.']);
        // }
    }

    /**
     * Mua sản phẩm - tạo giao dịch cửa hàng
     * Logic: Validate sản phẩm → Kiểm tra số dư → Tạo StoreTransaction → Khóa tiền → Giảm số lượng sản phẩm
     */
    public function buyProduct(Request $request, StoreProduct $product): \Illuminate\Http\RedirectResponse
    {
        // Validate product availability
        if (!$product->is_active || $product->is_sold || $product->is_deleted) {
            return back()->withErrors(['product' => 'Sản phẩm không có sẵn']);
        }

        // Check if user is trying to buy their own product
        if ($product->store->customer_id === $this->customer->id) {
            return back()->withErrors(['product' => 'Không thể mua sản phẩm của chính mình']);
        }

        // Calculate fee for store transaction (1% cố định)
        $fee = $this->calculateStoreTransactionFee($product->price);
        $totalAmount = $product->price + $fee;

        // Check if customer has enough balance
        if ($this->customer->wallet_balance < $totalAmount) {
            return back()->withErrors(['balance' => 'Số dư không đủ để mua sản phẩm này. Cần: ' . number_format($totalAmount) . ' VNĐ']);
        }

        try {
            DB::transaction(function () use ($product, $fee, $totalAmount) {
                // Create store transaction với trạng thái PENDING
                $transaction = \App\Models\StoreTransaction::create([
                    'transaction_code' => 'ST-' . time() . '-' . rand(1000, 9999),
                    'buyer_id' => $this->customer->id,
                    'seller_id' => $product->store->customer_id,
                    'product_id' => $product->id,
                    'amount' => $product->price,
                    'fee' => $fee,
                    'auto_complete_at' => now()->addDays(3), // 3 ngày tự động hoàn thành
                    'description' => "Mua sản phẩm: {$product->name}",
                    'status' => \App\States\StoreTransaction\PendingState::class,
                ]);

                // Lock buyer's money
                $this->customer->decrement('wallet_balance', $totalAmount);

                // Mark product as sold
                $product->update([
                    'is_sold' => true,
                    'sold_at' => now(),
                ]);

                // Create wallet transaction record for buyer
                \App\Models\WalletTransaction::create([
                    'customer_id' => $this->customer->id,
                    'type' => 'buy',
                    'transaction_type' => 'store_purchase',
                    'amount' => $totalAmount,
                    'description' => "Mua sản phẩm: {$product->name}",
                    'reference_id' => $transaction->id,
                    'status' => 'completed',
                ]);
            });

            return redirect()->route('customer.store.transactions.index')
                ->with('success', 'Đã tạo giao dịch thành công! Bạn có thể chat với người bán để trao đổi sản phẩm.');

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Có lỗi xảy ra khi tạo giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Tính phí giao dịch cửa hàng (1% cố định theo README)
     * 
     * @param float $amount
     * @return float
     */
    private function calculateStoreTransactionFee(float $amount): float
    {
        // Phí cố định 1% cho giao dịch cửa hàng
        return round($amount * 0.01, 2);
    }

}
