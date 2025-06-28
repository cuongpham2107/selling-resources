<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TransactionChat extends Model
{
    protected $fillable = [
        'transaction_id',
        'transaction_type',
        'sender_id',
        'message',
        'images',
    ];

    protected $casts = [
        'images' => 'array',
    ];

    // Relationships
    public function sender(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_id');
    }

    public function transaction()
    {
        return $this->transaction_type === 'intermediate' 
            ? $this->belongsTo(IntermediateTransaction::class, 'transaction_id')
            : $this->belongsTo(StoreTransaction::class, 'transaction_id');
    }

    // Helper methods
    public function hasImages(): bool
    {
        return !empty($this->images);
    }

    public function getImageCount(): int
    {
        return count($this->images ?? []);
    }

    public function canSendImages(Customer $customer): bool
    {
        // Kiểm tra giới hạn 3 ảnh/người/ngày/giao dịch
        $dailyLimit = SystemSetting::getValue('transaction_chat_daily_image_limit', 3);
        
        $todayImageCount = static::where('transaction_id', $this->transaction_id)
            ->where('transaction_type', $this->transaction_type)
            ->where('sender_id', $customer->id)
            ->whereDate('created_at', today())
            ->get()
            ->sum(function ($chat) {
                return count($chat->images ?? []);
            });

        return $todayImageCount < $dailyLimit;
    }
}
