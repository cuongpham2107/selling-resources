<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\StoreProduct;
use App\Models\PersonalStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends BaseCustomerController
{
    public function index()
    {


        $store = PersonalStore::where('owner_id', $this->customer->id)->first();

        if (!$store) {
            return redirect()->route('customer.store.create')
                ->with('error', 'You need to create a store first before adding products.');
        }

        $products = $store->products()
            ->withCount(['transactions as sales_count' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->paginate(12);

        return Inertia::render('customer/Products/Index', [
            'store' => $store,
            'products' => $products,
        ]);
    }

    public function create()
    {
        
        
        $store = PersonalStore::where('owner_id', $this->customer->id)->first();
        
        if (!$store) {
            return redirect()->route('customer.store.create')
                ->with('error', 'You need to create a store first before adding products.');
        }

        return Inertia::render('customer/Products/Create', [
            'store' => $store,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {


        $store = PersonalStore::where('owner_id', $this->customer->id)->first();

        if (!$store) {
            return redirect()->route('customer.store.create')
                ->with('error', 'You need to create a store first.');
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:4999999.99'],
            'images' => ['nullable', 'array', 'max:5'],
            'images.*' => ['image', 'max:5120'], // 5MB per image
            'content' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ], [
            'name.required' => 'Tên sản phẩm là bắt buộc.',
            'name.string' => 'Tên sản phẩm phải là chuỗi ký tự.',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'description.required' => 'Mô tả sản phẩm là bắt buộc.',
            'description.string' => 'Mô tả sản phẩm phải là chuỗi ký tự.',
            'description.max' => 'Mô tả không được vượt quá 2000 ký tự.',
            'price.required' => 'Giá sản phẩm là bắt buộc.',
            'price.numeric' => 'Giá phải là một số hợp lệ.',
            'price.min' => 'Giá phải ít nhất là 0.01 VNĐ.',
            'price.max' => 'Giá không được vượt quá 4,999,999.99 VNĐ.',
            'images.array' => 'Danh sách hình ảnh phải là một mảng.',
            'images.max' => 'Bạn không thể tải lên quá 5 hình ảnh.',
            'images.*.image' => 'Các tệp tải lên phải là hình ảnh (jpg, jpeg, png, bmp, gif, svg, webp).',
            'images.*.max' => 'Mỗi hình ảnh không được vượt quá 5MB.',
            'content.string' => 'Nội dung chi tiết phải là chuỗi ký tự.',
            'is_active.boolean' => 'Trạng thái hoạt động phải là đúng hoặc sai.',
        ]);

        // Handle image uploads
        $imagePaths = [];
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $imagePaths[] = $image->store('product-images', 'public');
            }
        }

        $product = StoreProduct::create([
            'store_id' => $store->id,
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'images' => $imagePaths,
            'content' => $validated['content'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('customer.products.index')
            ->with('success', 'Sản phẩm đã được tạo thành công!');
    }

    public function show(StoreProduct $product): Response
    {
        
        
        if ($product->store->owner_id !== $this->customer->id) {
            abort(403);
        }

        $product->load([
            'store',
            'transactions' => function ($query) {
                $query->with('buyer:id,username')
                    ->latest()
                    ->limit(10);
            }
        ]);

        // Get sales analytics
        $totalSales = $product->transactions()
            ->where('status', 'completed')
            ->sum('amount');
        
        $totalOrders = $product->transactions()
            ->where('status', 'completed')
            ->count();

        $recentPurchases = $product->transactions()
            ->with('buyer:id,username')
            ->where('status', 'completed')
            ->latest()
            ->limit(5)
            ->get();

        return Inertia::render('customer/Products/Show', [
            'product' => $product,
            'analytics' => [
                'total_sales' => $totalSales,
                'total_orders' => $totalOrders,
                'recent_purchases' => $recentPurchases,
            ],
        ]);
    }

    public function edit(StoreProduct $product): Response
    {
        
        
        if ($product->store->owner_id !== $this->customer->id) {
            abort(403);
        }

        return Inertia::render('customer/Products/Edit', [
            'product' => $product->load('store'),
        ]);
    }

    public function update(Request $request, StoreProduct $product): RedirectResponse
    {
        
        
        if ($product->store->owner_id !== $this->customer->id) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0.01', 'max:999999.99'],
            'new_images' => ['nullable', 'array', 'max:5'],
            'new_images.*' => ['image', 'max:5120'],
            'remove_images' => ['nullable', 'array'],
            'content' => ['nullable', 'string'],
            'is_active' => ['boolean'],
        ], [
            'name.required' => 'Tên sản phẩm là bắt buộc.',
            'name.string' => 'Tên sản phẩm phải là chuỗi ký tự.',
            'name.max' => 'Tên sản phẩm không được vượt quá 255 ký tự.',
            'description.required' => 'Mô tả sản phẩm là bắt buộc.',
            'description.string' => 'Mô tả sản phẩm phải là chuỗi ký tự.',
            'description.max' => 'Mô tả không được vượt quá 2000 ký tự.',
            'price.required' => 'Giá sản phẩm là bắt buộc.',
            'price.numeric' => 'Giá phải là một số hợp lệ.',
            'price.min' => 'Giá phải ít nhất là 0.01 VNĐ.',
            'price.max' => 'Giá không được vượt quá 999,999.99 VNĐ.',
            'new_images.array' => 'Danh sách hình ảnh mới phải là một mảng.',
            'new_images.max' => 'Bạn không thể tải lên quá 5 hình ảnh mới.',
            'new_images.*.image' => 'Các tệp tải lên phải là hình ảnh (jpg, jpeg, png, bmp, gif, svg, webp).',
            'new_images.*.max' => 'Mỗi hình ảnh không được vượt quá 5MB.',
            'remove_images.array' => 'Danh sách hình ảnh cần xóa phải là một mảng.',
            'content.string' => 'Nội dung chi tiết phải là chuỗi ký tự.',
            'is_active.boolean' => 'Trạng thái hoạt động phải là đúng hoặc sai.',
        ]);

        // Handle existing images
        $currentImages = $product->images ?? [];
        if ($request->has('remove_images')) {
            foreach ($request->input('remove_images') as $imageToRemove) {
                if (in_array($imageToRemove, $currentImages)) {
                    Storage::disk('public')->delete($imageToRemove);
                    $currentImages = array_filter($currentImages, fn($img) => $img !== $imageToRemove);
                }
            }
        }

        // Handle new images
        if ($request->hasFile('new_images')) {
            foreach ($request->file('new_images') as $image) {
                $currentImages[] = $image->store('product-images', 'public');
            }
        }

        $product->update([
            'name' => $validated['name'],
            'description' => $validated['description'],
            'price' => $validated['price'],
            'images' => array_values($currentImages),
            'content' => $validated['content'] ?? null,
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return redirect()->route('customer.products.show', $product)
            ->with('success', 'Sản phẩm đã được cập nhật thành công!');
    }

    public function destroy(StoreProduct $product): RedirectResponse
    {
        
        
        if ($product->store->owner_id !== $this->customer->id) {
            abort(403);
        }

        // Check if product has any transactions
        if ($product->transactions()->exists()) {
            return back()->withErrors(['message' => 'Không thể xóa sản phẩm có giao dịch.']);
        }

        // Delete associated images
        if ($product->images) {
            foreach ($product->images as $image) {
                Storage::disk('public')->delete($image);
            }
        }

        $product->delete();

        return redirect()->route('customer.products.index')
            ->with('success', 'Sản phẩm đã được xóa thành công!');
    }
}
