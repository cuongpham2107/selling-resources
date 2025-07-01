<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'referrer_id',
        'referred_id',
        'status',
        'total_points_earned',
        'successful_transactions',
        'first_transaction_at',
    ];

    protected $casts = [
        'total_points_earned' => 'integer',
        'first_transaction_at' => 'datetime',
    ];

    /**
     * Get the customer who referred (referrer)
     * 
     * Lấy thông tin khách hàng đã giới thiệu (người giới thiệu)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function referrer()
    {
        return $this->belongsTo(Customer::class, 'referrer_id');
    }

    /**
     * Get the customer who was referred
     * 
     * Lấy thông tin khách hàng được giới thiệu (người được giới thiệu)
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function referred()
    {
        return $this->belongsTo(Customer::class, 'referred_id');
    }

    /**
     * Add points and increment transaction count for the referral
     * 
     * Thêm điểm và tăng số lượng giao dịch thành công cho mối quan hệ giới thiệu
     * Nếu là giao dịch đầu tiên, sẽ ghi lại thời gian thực hiện
     * 
     * @param int $points Số điểm cần thêm
     * @return void
     */
    public function addPoints(int $points): void
    {
        $this->total_points_earned += $points;
        $this->successful_transactions += 1;
        
        if (!$this->first_transaction_at) {
            $this->first_transaction_at = now();
        }
        
        $this->save();
    }

    /**
     * Check if this is the first transaction
     * 
     * Kiểm tra xem đây có phải là giao dịch đầu tiên hay không
     * 
     * @return bool True nếu chưa có giao dịch thành công nào
     */
    public function isFirstTransaction(): bool
    {
        return $this->successful_transactions === 0;
    }
}
