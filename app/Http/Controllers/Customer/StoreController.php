<?php

namespace App\Http\Controllers\Customer;

use App\Models\PersonalStore;
use App\Models\StoreProduct;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StoreController extends BaseCustomerController
{
    public function index(): Response
    {
        $store = PersonalStore::with(['products'])->where('owner_id', $this->customer->id)->first();
       
        return Inertia::render('customer/Store/Index', [
            'store' => $store,
            'hasStore' => !is_null($store),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('customer/Store/Create');
    }

    public function store(Request $request)
    {

        // Check if customer already has a store
        if (PersonalStore::where('owner_id', $this->customer->id)->exists()) {
            return back()->withErrors(['message' => 'Bạn đã có cửa hàng rồi.']);
        }

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255', 'unique:personal_stores,store_name'],
            'description' => ['required', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB max
        ], [
            'store_name.required' => 'Tên cửa hàng là bắt buộc.',
            'store_name.string' => 'Tên cửa hàng phải là chuỗi ký tự.',
            'store_name.max' => 'Tên cửa hàng không được vượt quá 255 ký tự.',
            'store_name.unique' => 'Tên cửa hàng này đã được sử dụng. Vui lòng chọn tên khác.',
            'description.required' => 'Mô tả cửa hàng là bắt buộc.',
            'description.string' => 'Mô tả cửa hàng phải là chuỗi ký tự.',
            'description.max' => 'Mô tả cửa hàng không được vượt quá 1000 ký tự.',
            'avatar.image' => 'Logo cửa hàng phải là một tệp hình ảnh (jpg, jpeg, png, bmp, gif, svg, webp).',
            'avatar.max' => 'Logo cửa hàng không được vượt quá 2MB.',
        ]);
        $logoPath = null;
        if ($request->hasFile('avatar')) {
            $logoPath = $request->file('avatar')->store('store-logos', 'public');
        }

        $store = PersonalStore::create([
            'owner_id' => $this->customer->id,
            'store_name' => $validated['store_name'],
            'description' => $validated['description'],
            'avatar' => $logoPath,
            'is_active' => true,
        ]);

        return redirect()->route('customer.store.index')
            ->with('success', 'Cửa hàng đã được tạo thành công!');
    }

    public function edit(PersonalStore $store): Response
    {

        if ($store->owner_id !== $this->customer->id) {
            abort(403);
        }

        return Inertia::render('customer/Store/Edit', [
            'store' => $store,
        ]);
    }

    public function update(Request $request, PersonalStore $store)
    {

        if ($store->owner_id !== $this->customer->id) {
            abort(403);
        }

        $validated = $request->validate([
            'store_name' => ['required', 'string', 'max:255', 'unique:personal_stores,store_name,' . $store->id],
            'description' => ['required', 'string', 'max:1000'],
            'avatar' => ['nullable', 'image', 'max:2048'],
        ], [
            'store_name.required' => 'Tên cửa hàng là bắt buộc.',
            'store_name.string' => 'Tên cửa hàng phải là chuỗi ký tự.',
            'store_name.max' => 'Tên cửa hàng không được vượt quá 255 ký tự.',
            'store_name.unique' => 'Tên cửa hàng này đã được sử dụng. Vui lòng chọn tên khác.',
            'description.required' => 'Mô tả cửa hàng là bắt buộc.',
            'description.string' => 'Mô tả cửa hàng phải là chuỗi ký tự.',
            'description.max' => 'Mô tả cửa hàng không được vượt quá 1000 ký tự.',
            'avatar.image' => 'Logo cửa hàng phải là một tệp hình ảnh (jpg, jpeg, png, bmp, gif, svg, webp).',
            'avatar.max' => 'Logo cửa hàng không được vượt quá 2MB.',
        ]);

        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($store->avatar) {
                Storage::disk('public')->delete($store->avatar);
            }
            $logoPath = $request->file('avatar')->store('store-logos', 'public');
            $validated['avatar'] = $logoPath;
        }

        $store->update($validated);

        return redirect()->route('customer.store.index')
            ->with('success', 'Cửa hàng đã được cập nhật thành công!');
    }

    public function destroy(PersonalStore $store)
    {
        
        if ($store->owner_id !== $this->customer->id) {
            abort(403);
        }

        // Check if store has active products
        if ($store->products()->exists()) {
            return back()->withErrors(['message' => 'Không thể xóa cửa hàng có sản phẩm. Vui lòng xóa tất cả sản phẩm trước.']);
        }

        // Delete avatar if exists
        if ($store->avatar) {
            Storage::disk('public')->delete($store->avatar);
        }

        $store->delete();

        return redirect()->route('customer.store.index')
            ->with('success', 'Cửa hàng đã được xóa thành công!');
    }

    public function products(PersonalStore $store): Response
    {

        if ($store->owner_id !== $this->customer->id) {
            abort(403);
        }

        $products = $store->products()
            ->with(['transactions' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->paginate(12);

        return Inertia::render('customer/Store/Products', [
            'store' => $store,
            'products' => $products,
        ]);
    }

    public function analytics(PersonalStore $store): Response
    {
        if ($store->owner_id !== $this->customer->id) {
            abort(403);
        }

        // Get store analytics
        $totalProducts = $store->products()->count();
        $totalSales = $store->products()
            ->join('store_transactions', 'store_products.id', '=', 'store_transactions.product_id')
            ->where('store_transactions.status', 'completed')
            ->sum('store_transactions.amount');
        
        $totalOrders = $store->products()
            ->join('store_transactions', 'store_products.id', '=', 'store_transactions.product_id')
            ->where('store_transactions.status', 'completed')
            ->count();

        $recentOrders = $store->products()
            ->join('store_transactions', 'store_products.id', '=', 'store_transactions.product_id')
            ->join('customers', 'store_transactions.buyer_id', '=', 'customers.id')
            ->select([
                'store_transactions.*',
                'store_products.name as product_name',
                'customers.username as buyer_username'
            ])
            ->orderBy('store_transactions.created_at', 'desc')
            ->limit(10)
            ->get();

        return Inertia::render('customer/Store/Analytics', [
            'store' => $store,
            'analytics' => [
                'total_products' => $totalProducts,
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'recent_orders' => $recentOrders,
            ],
        ]);
    }
}
