<?php

namespace App\Models;

use App\Enums\PointTransactionType;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PointTransaction extends Model
{
    protected $fillable = [
        'customer_id',
        'type',
        'amount',
        'balance_after',
        'related_transaction_type',
        'related_transaction_id',
        'related_customer_id',
        'description',
    ];

    protected $casts = [
        'amount' => 'integer',
        'balance_after' => 'integer',
        'type' => PointTransactionType::class,
        'related_transaction_type' => TransactionType::class,
    ];

    /**
     * Get the customer who owns this point transaction
     * 
     * Lấy thông tin khách hàng sở hữu giao dịch điểm này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the related customer in this point transaction
     * 
     * Lấy thông tin khách hàng liên quan trong giao dịch điểm này
     * (Ví dụ: người gửi điểm trong giao dịch nhận điểm)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function relatedCustomer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'related_customer_id');
    }

   

    /**
     * Get the formatted amount attribute with Vietnamese number formatting
     * 
     * Lấy thuộc tính số lượng đã được định dạng theo kiểu Việt Nam
     * 
     * @return string Số điểm đã được định dạng (VD: "1.000 điểm")
     */
    public function getFormattedAmountAttribute(): string
    {
        return number_format($this->amount, 0, ',', '.') . ' điểm';
    }
}
