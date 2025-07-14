<?php

namespace App\Models;

use App\Enums\IntermediateTransactionStatus;
use App\States\IntermediateTransaction\IntermediateTransactionState;
use App\States\IntermediateTransaction\Transitions\CancelTransition;
use App\States\IntermediateTransaction\Transitions\ConfirmTransition;
use App\States\IntermediateTransaction\Transitions\MarkAsReceivedTransition;
use App\States\IntermediateTransaction\Transitions\MarkAsShippedTransition;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\ModelStates\HasStates;

/**
 * Model quản lý giao dịch trung gian
 * 
 * Giao dịch trung gian là loại giao dịch có người trung gian giữ tiền
 * cho đến khi cả buyer và seller đều xác nhận hoàn thành.
 * 
 * @property string $transaction_code Mã giao dịch duy nhất (8 ký tự)
 * @property int $buyer_id ID của người mua
 * @property int $seller_id ID của người bán  
 * @property string $description Mô tả giao dịch
 * @property float $amount Số tiền giao dịch (không bao gồm phí)
 * @property float $fee Phí giao dịch
 * @property int $duration_hours Thời hạn giao dịch (giờ)
 * @property IntermediateTransactionStatus $status Trạng thái giao dịch
 * @property Carbon $confirmed_at Thời điểm xác nhận
 * @property Carbon $seller_sent_at Thời điểm người bán gửi hàng
 * @property Carbon $buyer_received_at Thời điểm người mua nhận hàng
 * @property Carbon $expires_at Thời điểm hết hạn
 * @property Carbon $completed_at Thời điểm hoàn thành
 */
class IntermediateTransaction extends Model
{
    use HasStates;
    /**
     * Các trường có thể mass assignment
     */
    protected $fillable = [
        'transaction_code',
        'buyer_id',
        'seller_id',
        'description',
        'amount',
        'fee',
        'duration_hours',
        'status',
        'confirmed_at',
        'seller_sent_at',
        'buyer_received_at',
        'expires_at',
        'completed_at',
    ];

    /**
     * Cấu hình cast cho các thuộc tính
     * Tự động convert kiểu dữ liệu khi truy xuất từ database
     */
    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'status' => IntermediateTransactionState::class,
        'confirmed_at' => 'datetime',
        'seller_sent_at' => 'datetime',
        'buyer_received_at' => 'datetime',
        'expires_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    /**
     * Các thuộc tính được append tự động khi serialize model
     * transaction_fee sẽ được tính toán và thêm vào JSON response
     */
    protected $appends = [
        'transaction_fee',
    ];

    /**
     * Boot method - được gọi khi model được khởi tạo
     * Thiết lập các event listener cho model
     */
    protected static function booted()
    {
        static::creating(function ($transaction) {
            // Tự động tạo mã giao dịch unique nếu chưa được cung cấp
            if (empty($transaction->transaction_code)) {
                $transaction->transaction_code = $transaction->generateTransactionCode();
            }
        });
    }

    // Các mối quan hệ (Relationships)
    
    /**
     * Lấy thông tin người mua của giao dịch
     * 
     * @return BelongsTo
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'buyer_id');
    }

    /**
     * Lấy thông tin người bán của giao dịch
     * 
     * @return BelongsTo
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'seller_id');
    }

    /**
     * Lấy tất cả tin nhắn chat trong giao dịch trung gian này
     * 
     * @return HasMany
     */
    public function chats(): HasMany
    {
        return $this->hasMany(TransactionChat::class, 'transaction_id')
                    ->where('transaction_type', 'intermediate');
    }

    /**
     * Lấy tấtu tất cả tranh chấp liên quan đến giao dịch trng gian này
     * 
     * @return HasMany
     */
    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'transaction_id')
                    ->where('transaction_type', 'intermediate');
    }

    // Các phương thức hỗ trợ (Helper methods)
    
    /**
     * Kiểm tra xem giao dịch đã hết hạn chưa
     * 
     * @return bool True nếu giao dịch đã hết hạn
     */
    public function isExpired(): bool
    {
        return $this->expires_at && now()->isAfter($this->expires_at);
    }

    /**
     * Kiểm tra xem giao dịch có thể bị hủy không
     * Sử dụng state machine để kiểm tra
     * 
     * @return bool True nếu có thể hủy giao dịch
     */
    public function canBeCancelled(): bool
    {
        return $this->status->canBeCancelled();
    }

    /**
     * Kiểm tra xem giao dịch có thể hoàn thành hay không
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return $this->status instanceof \App\States\IntermediateTransaction\SellerSentState;
    }

    /**
     * Kiểm tra xem giao dịch có thể tranh chấp hay không
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return $this->status->canBeDisputed();
    }

    /**
     * Kiểm tra xem đây có phải trạng thái cuối cùng hay không
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return $this->status->isFinal();
    }

    /**
     * Lấy tổng số tiền (bao gồm phí)
     * 
     * @return float Tổng số tiền người mua phải trả
     */
    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->fee;
    }

    /**
     * Lấy số tiền người bán sẽ nhận được
     * (Không bao gồm phí, vì phí đã được trừ từ tổng tiền)
     * 
     * @return float Số tiền người bán nhận được
     */
    public function getSellerReceiveAmountAttribute(): float
    {
        return $this->amount;
    }

    /**
     * Tính toán phí giao dịch dựa trên số tiền và thời hạn
     * Bao gồm phí cơ bản + phí theo % + phí daily nếu >= 24h
     * 
     * @return float Số tiền phí đã được làm tròn
     */
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

    /**
     * Lấy số điểm thưởng cho giao dịch này
     * Dựa trên cấu hình trong bảng transaction_fees
     * 
     * @return int Số điểm thưởng
     */
    public function getPointsReward(): int
    {
        $transactionFee = TransactionFee::getApplicableFee($this->amount);
        return $transactionFee ? $transactionFee->points_reward : 0;
    }

    /**
     * Tạo mã giao dịch duy nhất 8 ký tự
     * Sử dụng MD5 hash của uniqid để đảm bảo tính duy nhất
     * 
     * @return string Mã giao dịch chữ hoa 8 ký tự
     */
    public function generateTransactionCode(): string
    {
        // Tạo mã giao dịch unique dài 8 ký tự XXXXXXXX
        return strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }

    /**
     * Lấy đối tượng TransactionFee áp dụng cho giao dịch này
     * 
     * @return TransactionFee|null Đối tượng phí giao dịch hoặc null
     */
    public function transactionFee(): ?TransactionFee
    {
        return TransactionFee::getApplicableFee($this->amount);
    }

    /**
     * Accessor để lấy thông tin phí giao dịch dưới dạng array
     * Được append tự động vào model khi serialize
     * 
     * @return array|null Mảng chứa id và amount của phí, hoặc null
     */
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

    // State Machine Transition Methods
    
    /**
     * Xác nhận giao dịch - chuyển từ Pending sang Confirmed
     * 
     * @return void
     */
    public function confirm(): void
    {
        $transition = new ConfirmTransition($this);
        if ($transition->canTransition()) {
            
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Đánh dấu đã gửi hàng - chuyển từ Confirmed sang SellerSent
     * 
     * @return void
     */
    public function markAsShipped(): void
    {
        $transition = new MarkAsShippedTransition($this);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Xác nhận đã nhận hàng - chuyển từ SellerSent sang Completed
     * 
     * @return void
     */
    public function markAsReceived(): void
    {
        $transition = new MarkAsReceivedTransition($this);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Hủy giao dịch - chuyển sang Cancelled
     * 
     * @return void
     */
    public function cancel(): void
    {
        $transition = new CancelTransition($this);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Đánh dấu giao dịch bị tranh chấp - chuyển sang Disputed
     * 
     * @return void
     */
    public function markAsDisputed(): void
    {
        $this->status()->transitionTo(\App\States\IntermediateTransaction\DisputedState::class);
    }
}
