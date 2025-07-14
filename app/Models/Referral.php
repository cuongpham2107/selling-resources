<?php

namespace App\Models;

use App\Enums\ReferralStatus;
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
        'status' => ReferralStatus::class,
        'total_points_earned' => 'decimal:2',
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
     * Chỉ thêm điểm nếu trạng thái là ACTIVE
     * 
     * @param int $points Số điểm cần thêm
     * @return bool True nếu thêm thành công, False nếu không thể thêm
     */
    public function addPoints(int $points): bool
    {
        // Chỉ thêm điểm nếu trạng thái là active
        if (!$this->canEarnRewards()) {
            return false;
        }

        $this->total_points_earned += $points;
        $this->successful_transactions += 1;
        
        if (!$this->first_transaction_at) {
            $this->first_transaction_at = now();
        }
        
        return $this->save();
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

    /**
     * Get status options for forms
     * 
     * Lấy danh sách trạng thái cho form
     * 
     * @return array
     */
    public static function getStatusOptions(): array
    {
        return ReferralStatus::getOptions();
    }

    /**
     * Get status label in Vietnamese
     * 
     * Lấy nhãn trạng thái bằng tiếng Việt
     * 
     * @return string
     */
    public function getStatusLabelAttribute(): string
    {
        return $this->status?->getLabel() ?? 'Không xác định';
    }

    /**
     * Check if referral can earn rewards
     * 
     * Kiểm tra xem có thể nhận thưởng không
     * 
     * @return bool
     */
    public function canEarnRewards(): bool
    {
        return $this->status === ReferralStatus::ACTIVE;
    }

    /**
     * Activate the referral
     * 
     * Kích hoạt mối quan hệ giới thiệu
     * 
     * @return bool
     */
    public function activate(): bool
    {
        if ($this->status === ReferralStatus::PENDING || $this->status === ReferralStatus::INACTIVE) {
            $this->status = ReferralStatus::ACTIVE;
            return $this->save();
        }
        return false;
    }

    /**
     * Deactivate the referral
     * 
     * Vô hiệu hóa mối quan hệ giới thiệu
     * 
     * @return bool
     */
    public function deactivate(): bool
    {
        if ($this->status === ReferralStatus::ACTIVE) {
            $this->status = ReferralStatus::INACTIVE;
            return $this->save();
        }
        return false;
    }
}
