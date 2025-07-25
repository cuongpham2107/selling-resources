<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreProduct extends Model
{
    protected $fillable = [
        'store_id',
        'name',
        'description',
        'images',
        'price',
        'content',
        'is_sold',
        'is_active',
        'is_deleted',
        'deleted_by',
        'sold_at',
        'deleted_at',
        'delete_reason',
    ];

    protected $casts = [
        'images' => 'array',
        'price' => 'decimal:2',
        'is_sold' => 'boolean',
        'is_active' => 'boolean',
        'is_deleted' => 'boolean',
        'sold_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $appends = [
        'seller_id',
    ];

    public function getSellerIdAttribute(): int
    {
        return $this->store->owner_id ?? 0;
    }
    // Relationships
    public function store(): BelongsTo
    {
        return $this->belongsTo(PersonalStore::class, 'store_id');
    }

    public function deletedBy(): BelongsTo
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(StoreTransaction::class, 'product_id');
    }

    // Helper methods
    public function isAvailable(): bool
    {
        return $this->is_active && !$this->is_sold && !$this->is_deleted;
    }

    public function markAsSold(): bool
    {
        $this->is_sold = 1;
        $this->sold_at = now();
        return $this->save();
    }
    // Chuyển trạng thái sẩn thành is_sold = false
    public function markAsAvailable()
    {
        $this->is_sold = 0;
        $this->sold_at = null;
        return $this->save();
    }

    public function markAsDeleted(\App\Models\User $moderator, string $reason = null): bool
    {
        $this->is_deleted = true;
        $this->deleted_by = $moderator->id;
        $this->deleted_at = now();
        $this->delete_reason = $reason;
        return $this->save();
    }

    public function getFormattedPriceAttribute(): string
    {
        return number_format($this->price, 0, ',', '.') . ' VNĐ';
    }

    public function getMainImageAttribute(): ?string
    {
        $images = $this->images ?? [];
        return !empty($images) ? $images[0] : null;
    }

    public function hasMultipleImages(): bool
    {
        return count($this->images ?? []) > 1;
    }

    public function scopeAvailable($query)
    {
        return $query->where('is_active', true)->where('is_sold', false)->where('is_deleted', false);
    }

    public function scopeFromActiveStores($query)
    {
        return $query->whereHas('store', function ($q) {
            $q->where('is_active', true)->where('is_locked', false);
        });
    }


}
