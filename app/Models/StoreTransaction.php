<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StoreTransaction extends Model
{
    protected $fillable = [
        'transaction_code',
        'buyer_id',
        'seller_id',
        'product_id',
        'amount',
        'fee',
        'status',
        'completed_at',
        'auto_complete_at',
        'buyer_early_complete',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'completed_at' => 'datetime',
        'auto_complete_at' => 'datetime',
        'buyer_early_complete' => 'boolean',
    ];

    // Relationships
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'seller_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'product_id');
    }

    public function chats(): HasMany
    {
        return $this->hasMany(TransactionChat::class, 'transaction_id')
                    ->where('transaction_type', 'store');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'transaction_id')
                    ->where('transaction_type', 'store');
    }

    // Helper methods
    public function isAutoCompleteTime(): bool
    {
        return $this->auto_complete_at && now()->isAfter($this->auto_complete_at);
    }

    public function canBeCompleted(): bool
    {
        return $this->status === 'processing';
    }

    public function canBeDisputed(): bool
    {
        return in_array($this->status, ['processing']);
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->fee;
    }

    public function getSellerReceiveAmountAttribute(): float
    {
        return $this->amount - $this->fee;
    }

    public function calculateFee(): float
    {
        $feePercentage = SystemSetting::getValue('store_transaction_fee_percentage', 1);
        return round($this->amount * $feePercentage / 100, 2);
    }

    public function setAutoCompleteTime(): void
    {
        $hours = SystemSetting::getValue('auto_complete_store_transaction_hours', 72);
        $this->auto_complete_at = now()->addHours($hours);
        $this->save();
    }
}
