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
     * Check if this is an earn/earned points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch kiếm điểm hay không
     * 
     * @return bool True nếu là giao dịch kiếm điểm
     */
    public function isEarned(): bool
    {
        return in_array($this->type, [PointTransactionType::EARNED, PointTransactionType::EARN]);
    }

    /**
     * Check if this is a referral bonus transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch thưởng giới thiệu hay không
     * 
     * @return bool True nếu là giao dịch thưởng giới thiệu
     */
    public function isReferralBonus(): bool
    {
        return $this->type === PointTransactionType::REFERRAL_BONUS;
    }

    /**
     * Check if this is a sent points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch gửi điểm hay không
     * 
     * @return bool True nếu là giao dịch gửi điểm
     */
    public function isSent(): bool
    {
        return $this->type === PointTransactionType::SENT;
    }

    /**
     * Check if this is a received points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch nhận điểm hay không
     * 
     * @return bool True nếu là giao dịch nhận điểm
     */
    public function isReceived(): bool
    {
        return $this->type === PointTransactionType::RECEIVED;
    }

    /**
     * Check if this is an exchanged points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch đổi điểm hay không
     * 
     * @return bool True nếu là giao dịch đổi điểm
     */
    public function isExchanged(): bool
    {
        return $this->type === PointTransactionType::EXCHANGED;
    }

    /**
     * Check if this is a spend points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch tiêu điểm hay không
     * 
     * @return bool True nếu là giao dịch tiêu điểm
     */
    public function isSpend(): bool
    {
        return $this->type === PointTransactionType::SPEND;
    }

    /**
     * Check if this is a transfer points transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch chuyển điểm hay không
     * 
     * @return bool True nếu là giao dịch chuyển điểm
     */
    public function isTransfer(): bool
    {
        return $this->type === PointTransactionType::TRANSFER;
    }

    /**
     * Check if this is an admin adjustment transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch điều chỉnh admin hay không
     * 
     * @return bool True nếu là giao dịch điều chỉnh admin
     */
    public function isAdminAdjust(): bool
    {
        return $this->type === PointTransactionType::ADMIN_ADJUST;
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
