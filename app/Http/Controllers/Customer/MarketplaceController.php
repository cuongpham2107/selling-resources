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
     */
    public function index(Request $request): Response
    {
        $customer = $this->getCustomer(); // Use BaseCustomerController method
        
        $query = StoreProduct::query()
            ->with(['store:id,store_name,rating,is_verified'])
            ->whereHas('store', function ($q) use ($customer) {
                $q->where('is_active', true)
                  ->where('is_locked', false);
                  
                // Exclude customer's own store if they have one
                if ($customer && $customer->personalStore) {
                    $q->where('id', '!=', $customer->personalStore->id);
                }
            })
            ->where('is_active', true)
            ->where('is_sold', false)
            ->where('is_deleted', false);

        // Search functionality
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Category filter (if needed later)
        if ($request->filled('category')) {
            // Add category filtering logic here
        }

        // Price range filter
        if ($request->filled('min_price')) {
            $query->where('price', '>=', $request->get('min_price'));
        }
        if ($request->filled('max_price')) {
            $query->where('price', '<=', $request->get('max_price'));
        }

        // Store filter
        if ($request->filled('store_id')) {
            $query->where('store_id', $request->get('store_id'));
        }

        // Sorting
        $sortBy = $request->get('sort', 'created_at');
        $sortOrder = $request->get('order', 'desc');
        
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
            case 'popular':
                $query->withCount(['transactions as sales_count' => function ($q) {
                    $q->where('status', 'completed');
                }])->orderBy('sales_count', 'desc');
                break;
            default:
                $query->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(4)->withQueryString();

        // Get marketplace statistics (excluding customer's own store)
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
                ->where('is_verified', true)
                ->where('is_locked', false)
                ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                    $q->where('id', '!=', $customer->personalStore->id);
                })
                ->orderBy('rating', 'desc')
                ->limit(6)
                ->get(['id', 'store_name', 'rating', 'avatar']),
        ];

        // Get popular stores for filter (excluding customer's own store)
        $popularStores = PersonalStore::where('is_active', true)
            ->where('is_locked', false)
            ->when($customer && $customer->personalStore, function ($q) use ($customer) {
                $q->where('id', '!=', $customer->personalStore->id);
            })
            ->orderBy('total_sales', 'desc')
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
     * Mua một sản phẩm
     */
    public function purchase(Request $request, StoreProduct $product)
    {
       
        // Validate product availability
        if (!$product->is_active || $product->is_sold || $product->is_deleted) {
            return back()->withErrors(['message' => 'Sản phẩm không còn khả dụng.']);
        }

        // Check if store is active
        if (!$product->store->is_active || $product->store->is_locked) {
            return back()->withErrors(['message' => 'Cửa hàng không hoạt động.']);
        }

        // Check if buyer is not the seller
        if ($product->store->owner_id === $this->customer->id) {
            return back()->withErrors(['message' => 'Không thể mua sản phẩm của chính mình.']);
        }

        // Check if customer has enough balance
        if (!$this->customer->balance->hasEnoughBalance($product->price)) {
            return back()->withErrors(['message' => 'Số dư ví không đủ để thực hiện giao dịch.']);
        }

        // Generate unique transaction code
        do {
            $transactionCode = strtoupper(bin2hex(random_bytes(8)));
            $transactionCode = substr($transactionCode, 0, 4) . '-' .
                               substr($transactionCode, 4, 4) . '-' .
                               substr($transactionCode, 8, 4) . '-' .
                               substr($transactionCode, 12, 4);
        
        } while (\App\Models\StoreTransaction::where('transaction_code', $transactionCode)->exists());

        try {
            DB::beginTransaction();

            // Create store transaction
            $transaction = \App\Models\StoreTransaction::create([
                'transaction_code' => $transactionCode,
                'buyer_id' => $this->customer->id,
                'seller_id' => $product->store->owner_id,
                'product_id' => $product->id,
                'amount' => $product->price,
                'fee' => $product->price * 0.01, // 1% fee
                'status' => 'processing',
            ]);
            

            //Đặt thời gian tự động hoàn thành (mặc định là 72 giờ)
            $transaction->setAutoCompleteTime();

            // Deduct money from buyer's balance
            if (!$this->customer->balance->deductBalance($product->price)) {
                throw new \Exception('Không thể trừ tiền từ số dư.');
            }
            // Mark product as sold
            $product->update(['is_sold' => true]);

            // Create wallet transaction for buyer
            \App\Models\WalletTransaction::create([
                'customer_id' => $this->customer->id,
                'type' => 'debit',
                'transaction_type' => 'store_purchase',
                'amount' => $product->price,
                'description' => "Mua sản phẩm: {$product->name}",
                'reference_id' => $transaction->id,
                'status' => 'completed',
            ]);

            DB::commit();

            return redirect()->route('customer.store.transactions.show', $transaction)
                ->with('success', 'Đã mua sản phẩm thành công! Giao dịch sẽ tự động hoàn thành sau 72 giờ.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi xử lý giao dịch. Vui lòng thử lại.']);
        }
    }

}
