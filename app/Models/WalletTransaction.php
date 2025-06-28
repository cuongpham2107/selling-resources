<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WalletTransaction extends Model
{
    protected $fillable = [
        'transaction_code',
        'customer_id',
        'type',
        'amount',
        'fee',
        'net_amount',
        'status',
        'payment_method',
        'description',
        'vnpay_txn_ref',
        'vnpay_transaction_no',
        'vnpay_bank_code',
        'vnpay_response_code',
        'vnpay_response',
        'withdrawal_info',
        'transfer_info',
        'recipient_id',
        'sender_id',
        'note',
        'processed_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'net_amount' => 'decimal:2',
        'vnpay_response' => 'array',
        'withdrawal_info' => 'array',
        'transfer_info' => 'array',
        'processed_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($transaction) {
            // Generate unique transaction code if not provided
            if (empty($transaction->transaction_code)) {
                $transaction->transaction_code = $transaction->generateTransactionCode();
            }
            
            // Calculate net amount based on transaction type
            if ($transaction->type === 'deposit') {
                $transaction->net_amount = $transaction->amount; // Nạp tiền: nhận đủ số tiền
            } else {
                $transaction->net_amount = $transaction->amount - $transaction->fee; // Rút/chuyển: trừ phí
            }
        });
    }

    // Relationships
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

    // Helper Methods
    public function generateTransactionCode(): string
    {
        $prefix = match($this->type) {
            'deposit' => 'DP',
            'withdrawal' => 'WD',
            'transfer_in' => 'TI',
            'transfer_out' => 'TO',
            default => 'WT'
        };
        
        return $prefix . date('ymd') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isCompleted(): bool
    {
        return $this->status === 'completed';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markAsProcessing(): void
    {
        $this->update([
            'status' => 'processing',
            'processed_at' => now(),
        ]);
    }

    public function markAsCompleted(): void
    {
        $this->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function markAsFailed(string $reason = null): void
    {
        $this->update([
            'status' => 'failed',
            'description' => $reason ? $this->description . ' - Failed: ' . $reason : $this->description,
        ]);
    }

    // VNPay specific methods
    public function updateVnpayResponse(array $response): void
    {
        $this->update([
            'vnpay_response' => $response,
            'vnpay_response_code' => $response['vnp_ResponseCode'] ?? null,
            'vnpay_transaction_no' => $response['vnp_TransactionNo'] ?? null,
        ]);
    }

    public function isVnpaySuccess(): bool
    {
        return $this->vnpay_response_code === '00';
    }

    // Scopes
    public function scopeDeposits($query)
    {
        return $query->where('type', 'deposit');
    }

    public function scopeWithdrawals($query)
    {
        return $query->where('type', 'withdrawal');
    }

    public function scopeTransfers($query)
    {
        return $query->whereIn('type', ['transfer_in', 'transfer_out']);
    }

    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}
