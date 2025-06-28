<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CustomerBalance extends Model
{
    protected $fillable = [
        'customer_id',
        'balance',
        'locked_balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
        'locked_balance' => 'decimal:2',
    ];

    /**
     * Get the customer that owns this balance record
     * 
     * Lấy thông tin khách hàng sở hữu bản ghi số dư này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get the available balance (balance minus locked balance)
     * 
     * Lấy số dư khả dụng (số dư trừ đi số dư bị khóa)
     * 
     * @return float Số dư khả dụng
     */
    public function getAvailableBalanceAttribute(): float
    {
        return $this->balance - $this->locked_balance;
    }

    /**
     * Check if the customer has enough available balance for a transaction
     * 
     * Kiểm tra xem khách hàng có đủ số dư khả dụng cho giao dịch hay không
     * 
     * @param float $amount Số tiền cần kiểm tra
     * @return bool True nếu có đủ số dư
     */
    public function hasEnoughBalance(float $amount): bool
    {
        return $this->getAvailableBalanceAttribute() >= $amount;
    }

    /**
     * Lock a specific amount from the available balance
     * 
     * Khóa một số tiền cụ thể từ số dư khả dụng
     * Số tiền này sẽ không thể sử dụng cho đến khi được mở khóa
     * 
     * @param float $amount Số tiền cần khóa
     * @return bool True nếu khóa thành công
     */
    public function lockAmount(float $amount): bool
    {
        if (!$this->hasEnoughBalance($amount)) {
            return false;
        }

        $this->locked_balance += $amount;
        return $this->save();
    }

    /**
     * Unlock a specific amount from the locked balance
     * 
     * Mở khóa một số tiền cụ thể từ số dư bị khóa
     * Số tiền này sẽ trở lại số dư khả dụng
     * 
     * @param float $amount Số tiền cần mở khóa
     * @return bool True nếu mở khóa thành công
     */
    public function unlockAmount(float $amount): bool
    {
        $this->locked_balance = max(0, $this->locked_balance - $amount);
        return $this->save();
    }

    /**
     * Deduct an amount from the total balance
     * 
     * Trừ một số tiền từ tổng số dư
     * Kiểm tra đảm bảo số dư đủ trước khi trừ
     * 
     * @param float $amount Số tiền cần trừ
     * @return bool True nếu trừ thành công
     */
    public function deductBalance(float $amount): bool
    {
        if ($this->balance < $amount) {
            return false;
        }

        $this->balance -= $amount;
        return $this->save();
    }

    /**
     * Add an amount to the total balance
     * 
     * Thêm một số tiền vào tổng số dư
     * 
     * @param float $amount Số tiền cần thêm
     * @return bool True nếu thêm thành công
     */
    public function addBalance(float $amount): bool
    {
        $this->balance += $amount;
        return $this->save();
    }
}
