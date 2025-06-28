<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CustomerPoint extends Model
{
    protected $fillable = [
        'customer_id',
        'points',
    ];

    protected $casts = [
        'points' => 'integer',
    ];

    /**
     * Get the customer that owns this points record
     * 
     * Lấy thông tin khách hàng sở hữu bản ghi điểm này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\BelongsTo
     */
    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    /**
     * Get all point transactions for this customer
     * 
     * Lấy tất cả giao dịch điểm của khách hàng này
     * 
     * @return \Illuminate\Database\Eloquent\Relations\HasMany
     */
    public function transactions(): HasMany
    {
        return $this->hasMany(PointTransaction::class, 'customer_id', 'customer_id');
    }

    /**
     * Add points to the customer's account and create a transaction record
     * 
     * Thêm điểm vào tài khoản khách hàng và tạo bản ghi giao dịch
     * Sẽ tự động tạo PointTransaction để theo dõi lịch sử
     * 
     * @param int $amount Số điểm cần thêm
     * @param string $type Loại giao dịch (VD: 'referral', 'purchase', etc.)
     * @param string $description Mô tả giao dịch
     * @param array $additionalData Dữ liệu bổ sung cho giao dịch
     * @return bool True nếu thêm điểm thành công
     */
    public function addPoints(int $amount, string $type, string $description, array $additionalData = []): bool
    {
        $this->points += $amount;
        $saved = $this->save();

        if ($saved) {
            PointTransaction::create(array_merge([
                'customer_id' => $this->customer_id,
                'type' => $type,
                'amount' => $amount,
                'balance_after' => $this->points,
                'description' => $description,
            ], $additionalData));
        }

        return $saved;
    }

    /**
     * Deduct points from the customer's account and create a transaction record
     * 
     * Trừ điểm từ tài khoản khách hàng và tạo bản ghi giao dịch
     * Kiểm tra đảm bảo có đủ điểm trước khi trừ
     * 
     * @param int $amount Số điểm cần trừ
     * @param string $type Loại giao dịch (VD: 'redeem', 'penalty', etc.)
     * @param string $description Mô tả giao dịch
     * @param array $additionalData Dữ liệu bổ sung cho giao dịch
     * @return bool True nếu trừ điểm thành công
     */
    public function deductPoints(int $amount, string $type, string $description, array $additionalData = []): bool
    {
        if ($this->points < $amount) {
            return false;
        }

        $this->points -= $amount;
        $saved = $this->save();

        if ($saved) {
            PointTransaction::create(array_merge([
                'customer_id' => $this->customer_id,
                'type' => $type,
                'amount' => -$amount,
                'balance_after' => $this->points,
                'description' => $description,
            ], $additionalData));
        }

        return $saved;
    }

    /**
     * Get the value of points in VND currency
     * 
     * Lấy giá trị điểm quy đổi ra tiền VND
     * Sử dụng tỷ lệ quy đổi từ SystemSetting
     * 
     * @return int Giá trị điểm tính bằng VND
     */
    public function getValueInVndAttribute(): int
    {
        $rate = SystemSetting::getValue('point_to_vnd_rate', 500);
        return $this->points * $rate;
    }
}
