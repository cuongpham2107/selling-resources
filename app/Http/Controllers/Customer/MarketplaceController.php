<?php

namespace App\Http\Controllers\Customer;

use App\Models\StoreProduct;
use App\Models\PersonalStore;
use Illuminate\Http\Request;
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
            'store:id,store_name,description,rating,is_verified,total_sales,total_products',
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
}
