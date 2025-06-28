<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PersonalStore extends Model
{
    protected $fillable = [
        'owner_id',
        'store_name',
        'description',
        'avatar',
        'is_active',
        'is_verified',
        'is_locked',
        'locked_by',
        'locked_at',
        'lock_reason',
        'rating',
        'total_sales',
        'total_products',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'is_verified' => 'boolean',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
        'rating' => 'float',
        'total_sales' => 'integer',
        'total_products' => 'integer',
    ];

    /**
     * Get the customer who owns this personal store
     * 
     * Lấy thông tin khách hàng sở hữu cửa hàng cá nhân này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'owner_id');
    }

    /**
     * Get the admin user who locked this store
     * 
     * Lấy thông tin admin đã khóa cửa hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'locked_by');
    }

    /**
     * Get all products in this store
     * 
     * Lấy tất cả sản phẩm trong cửa hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function products(): HasMany
    {
        return $this->hasMany(StoreProduct::class, 'store_id');
    }

    /**
     * Get only active products in this store
     * 
     * Lấy chỉ những sản phẩm đang hoạt động trong cửa hàng này
     * (Đang hoạt động, chưa bị xóa, chưa bán)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function activeProducts(): HasMany
    {
        return $this->products()->where('is_active', true)
                                ->where('is_deleted', false)
                                ->where('is_sold', false);
    }

    /**
     * Get all transactions for this store
     * 
     * Lấy tất cả giao dịch của cửa hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(StoreTransaction::class, 'seller_id', 'owner_id');
    }

    /**
     * Check if the store can add new products
     * 
     * Kiểm tra xem cửa hàng có thể thêm sản phẩm mới hay không
     * Cửa hàng phải đang hoạt động và không bị khóa
     * 
     * @return bool True nếu có thể thêm sản phẩm
     */
    public function canAddProducts(): bool
    {
        return $this->is_active && !$this->is_locked;
    }

    /**
     * Lock the store with admin and reason
     * 
     * Khóa cửa hàng với admin thực hiện và lý do khóa
     * 
     * @param \App\Models\User $admin Admin thực hiện khóa
     * @param string $reason Lý do khóa cửa hàng
     * @return bool True nếu khóa thành công
     */
    public function lock(\App\Models\User $admin, string $reason): bool
    {
        $this->is_locked = true;
        $this->locked_by = $admin->id;
        $this->locked_at = now();
        $this->lock_reason = $reason;
        
        return $this->save();
    }

    /**
     * Unlock the store and clear lock information
     * 
     * Mở khóa cửa hàng và xóa thông tin khóa
     * 
     * @return bool True nếu mở khóa thành công
     */
    public function unlock(): bool
    {
        $this->is_locked = false;
        $this->locked_by = null;
        $this->locked_at = null;
        $this->lock_reason = null;
        
        return $this->save();
    }

    /**
     * Get the total number of products in this store
     * 
     * Lấy tổng số sản phẩm trong cửa hàng này
     * 
     * @return int Tổng số sản phẩm
     */
    public function getTotalProductsCountAttribute(): int
    {
        return $this->products()->count();
    }

    /**
     * Get the number of active products in this store
     * 
     * Lấy số lượng sản phẩm đang hoạt động trong cửa hàng này
     * 
     * @return int Số sản phẩm đang hoạt động
     */
    public function getActiveProductsCountAttribute(): int
    {
        return $this->activeProducts()->count();
    }

    /**
     * Get the number of sold products in this store
     * 
     * Lấy số lượng sản phẩm đã bán trong cửa hàng này
     * 
     * @return int Số sản phẩm đã bán
     */
    public function getSoldProductsCountAttribute(): int
    {
        return $this->products()->where('is_sold', true)->count();
    }
}
