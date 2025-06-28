<?php

namespace App\Models;

use App\Enums\IntermediateTransactionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class IntermediateTransaction extends Model
{
    protected $fillable = [
        'transaction_code',
        'customer_id',
        'buyer_id',
        'seller_id',
        'description',
        'amount',
        'fee',
        'duration_hours',
        'status',
        'type',
        'payment_method',
        'withdrawal_info',
        'recipient_id',
        'sender_id',
        'confirmed_at',
        'seller_sent_at',
        'buyer_received_at',
        'expires_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'status' => IntermediateTransactionStatus::class,
        'withdrawal_info' => 'array',
        'confirmed_at' => 'datetime',
        'seller_sent_at' => 'datetime',
        'buyer_received_at' => 'datetime',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = [
        'transaction_fee',
    ];

    protected static function booted()
    {
        static::creating(function ($transaction) {
            // Generate a unique transaction code if not provided
            if (empty($transaction->transaction_code)) {
                $transaction->transaction_code = $transaction->generateTransactionCode();
            }
        });
    }
    // Relationships
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'buyer_id');
    }

    public function seller(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'seller_id');
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'customer_id');
    }

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'recipient_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'sender_id');
    }

    public function chats(): HasMany
    {
        return $this->hasMany(TransactionChat::class, 'transaction_id')
                    ->where('transaction_type', 'intermediate');
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'transaction_id')
                    ->where('transaction_type', 'intermediate');
    }

    // Helper methods
    public function isExpired(): bool
    {
        return $this->expires_at && now()->isAfter($this->expires_at);
    }

    public function canBeCancelled(): bool
    {
        $status = $this->status instanceof IntermediateTransactionStatus ? $this->status : IntermediateTransactionStatus::from($this->status);
        return $status->canBeCancelled();
    }

    public function canBeCompleted(): bool
    {
        $status = $this->status instanceof IntermediateTransactionStatus ? $this->status : IntermediateTransactionStatus::from($this->status);
        return $status === IntermediateTransactionStatus::BUYER_RECEIVED && $this->seller_sent_at && $this->buyer_received_at;
    }

    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->fee;
    }

    public function getSellerReceiveAmountAttribute(): float
    {
        return $this->amount;
    }

    public function calculateFee(): float
    {
        $transactionFee = TransactionFee::getApplicableFee($this->amount);
        if (!$transactionFee) {
            return 0;
        }

        $baseFee = $transactionFee->fee_amount + ($this->amount * $transactionFee->fee_percentage / 100);
        
        // Thêm phí 20% nếu duration >= 24 giờ (chỉ cộng 1 lần, không nhân với số ngày)
        if ($this->duration_hours >= 24) {
            $dailyFeePercentage = $transactionFee->daily_fee_percentage / 100;
            $baseFee += $baseFee * $dailyFeePercentage;
        }

        return round($baseFee, 2);
    }

    public function getPointsReward(): int
    {
        $transactionFee = TransactionFee::getApplicableFee($this->amount);
        return $transactionFee ? $transactionFee->points_reward : 0;
    }

    public function generateTransactionCode(): string
    {
        // Generate a unique transaction code 8 characters long XXXXXXXX
        return strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    public function transactionFee(): ?TransactionFee
    {
        return TransactionFee::getApplicableFee($this->amount);
    }

    public function getTransactionFeeAttribute(): ?array
    {
        $fee = $this->transactionFee();
        if (!$fee) {
            return null;
        }

        return [
            'id' => $fee->id,
            'amount' => $this->calculateFee(),
        ];
    }
}
