<?php

namespace App\Models;

use App\States\StoreTransaction\StoreTransactionState;
use App\States\StoreTransaction\Transitions\CompleteStoreTransactionTransition;
use App\States\StoreTransaction\Transitions\DisputeStoreTransactionTransition;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Collection;
use Carbon\Carbon;
use Spatie\ModelStates\HasStates;

/**
 * Model StoreTransaction - Quản lý giao dịch mua bán sản phẩm trong cửa hàng
 * 
 * Bảng này lưu trữ thông tin các giao dịch mua bán sản phẩm giữa người mua và người bán.
 * Mỗi giao dịch có mã định danh duy nhất, thông tin người mua/bán, sản phẩm, số tiền và trạng thái.
 * Hỗ trợ tính năng tự động hoàn thành sau một khoảng thời gian và cho phép người mua hoàn thành sớm.
 * 
 * @property int $id
 * @property string $transaction_code Mã giao dịch duy nhất
 * @property int $buyer_id ID người mua
 * @property int $seller_id ID người bán  
 * @property int $product_id ID sản phẩm
 * @property float $amount Số tiền giao dịch
 * @property float $fee Phí giao dịch
 * @property string $status Trạng thái (processing, completed, disputed, cancelled)
 * @property Carbon|null $completed_at Thời gian hoàn thành
 * @property Carbon|null $auto_complete_at Thời gian tự động hoàn thành
 * @property bool $buyer_early_complete Người mua hoàn thành sớm
 * @property Carbon $created_at
 * @property Carbon $updated_at
 * 
 * @property Customer $buyer Người mua
 * @property Customer $seller Người bán
 * @property StoreProduct $product Sản phẩm
 * @property Collection<TransactionChat> $chats Tin nhắn giao dịch
 * @property Collection<Dispute> $disputes Khiếu nại
 * 
 * @property-read float $total_amount Tổng tiền (amount + fee)
 * @property-read float $seller_receive_amount Tiền người bán nhận (amount - fee)
 */
class StoreTransaction extends Model
{
    use HasStates;
    protected $fillable = [
        'transaction_code',
        'buyer_id',
        'seller_id',
        'product_id',
        'amount',
        'fee',
        'status',
        'completed_at',
        'auto_complete_at',
        'buyer_early_complete',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'fee' => 'decimal:2',
        'status' => StoreTransactionState::class,
        'completed_at' => 'datetime',
        'confirmed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'auto_complete_at' => 'datetime',
        'buyer_early_complete' => 'boolean',
    ];

    // Relationships - Các quan hệ với bảng khác
    
    /**
     * Quan hệ với người mua (Customer)
     * Một giao dịch cửa hàng thuộc về một người mua
     * 
     * @return BelongsTo
     */
    public function buyer(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'buyer_id');
    }

    /**
     * Quan hệ với người bán (Customer)
     * Một giao dịch cửa hàng thuộc về một người bán
     * 
     * @return BelongsTo
     */
    public function seller(): BelongsTo
    {
        return $this->belongsTo(Customer::class, 'seller_id');
    }

    /**
     * Quan hệ với sản phẩm cửa hàng (StoreProduct)
     * Một giao dịch cửa hàng liên quan đến một sản phẩm
     * 
     * @return BelongsTo
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(StoreProduct::class, 'product_id');
    }

    /**
     * Quan hệ với tin nhắn chat (TransactionChat)
     * Một giao dịch cửa hàng có nhiều tin nhắn
     * Chỉ lấy những tin nhắn có transaction_type = 'store'
     * 
     * @return HasMany
     */
    public function chats(): HasMany
    {
        return $this->hasMany(TransactionChat::class, 'transaction_id')
                    ->where('transaction_type', 'store');
    }

    /**
     * Quan hệ với khiếu nại (Dispute)
     * Một giao dịch cửa hàng có thể có nhiều khiếu nại
     * Chỉ lấy những khiếu nại có transaction_type = 'store'
     * 
     * @return HasMany
     */
    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class, 'transaction_id')
                    ->where('transaction_type', 'store');
    }

    // Helper methods - Các phương thức hỗ trợ
    
    /**
     * Kiểm tra xem giao dịch có đến thời gian tự động hoàn thành hay không
     * 
     * @return bool true nếu đã đến thời gian tự động hoàn thành
     */
    public function isAutoCompleteTime(): bool
    {
        return $this->auto_complete_at && now()->isAfter($this->auto_complete_at);
    }

    /**
     * Kiểm tra xem giao dịch có thể được hoàn thành hay không
     * Chỉ có thể hoàn thành khi trạng thái là 'processing'
     * 
     * @return bool true nếu có thể hoàn thành
     */
    public function canBeCompleted(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\ProcessingState;
    }

    /**
     * Kiểm tra xem giao dịch có thể bị khiếu nại hay không
     * Chỉ các giao dịch đang PROCESSING mới có thể tranh chấp
     * 
     * @return bool true nếu có thể khiếu nại
     */
    public function canBeDisputed(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\ProcessingState;
    }

    /**
     * Lấy tổng số tiền phải trả (amount + fee)
     * Được sử dụng như một accessor: $transaction->total_amount
     * 
     * @return float tổng số tiền
     */
    public function getTotalAmountAttribute(): float
    {
        return $this->amount + $this->fee;
    }

    /**
     * Lấy số tiền người bán nhận được (amount - 1% phí)
     * Được sử dụng như một accessor: $transaction->seller_receive_amount
     * 
     * @return float số tiền người bán nhận được
     */
    public function getSellerReceiveAmountAttribute(): float
    {
        // Store transaction: phí 1% được trừ từ người bán
        $feePercentage = SystemSetting::getValue('store_transaction_fee_percentage', 1);
        return $this->amount * (100 - $feePercentage) / 100;
    }

    /**
     * Tính phí giao dịch dựa trên phần trăm cấu hình hệ thống
     * 
     * @return float phí giao dịch
     */
    public function calculateFee(): float
    {
        $feePercentage = SystemSetting::getValue('store_transaction_fee_percentage', 1);
        return round($this->amount * $feePercentage / 100, 2);
    }

    /**
     * Thiết lập thời gian tự động hoàn thành
     * Dựa trên cấu hình số giờ trong hệ thống (mặc định 72 giờ)
     * 
     * @return void
     */
    public function setAutoCompleteTime(): void
    {
        $hours = SystemSetting::getValue('auto_complete_store_transaction_hours', 72);
        $this->auto_complete_at = now()->addHours($hours);
        $this->save();
    }

    // State Machine Transition Methods
    
    /**
     * Hoàn thành giao dịch cửa hàng - chuyển từ Processing sang Completed
     * 
     * @return void
     */
    public function complete(): void
    {
        $transition = new CompleteStoreTransactionTransition($this);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Tạo tranh chấp cho giao dịch cửa hàng
     * 
     * @param array $disputeData Dữ liệu tranh chấp
     * @return void
     */
    public function dispute(array $disputeData = []): void
    {
        $transition = new DisputeStoreTransactionTransition($this, $disputeData);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    /**
     * Đánh dấu giao dịch bị tranh chấp - chuyển sang Disputed (alias cho method dispute)
     * 
     * @return void
     */
    public function markAsDisputed(): void
    {
        $this->dispute();
    }

    /**
     * Xác nhận giao dịch từ người bán - chuyển từ PENDING sang PROCESSING
     * 
     * @return void
     */
    public function confirm(): void
    {
        $transition = new \App\States\StoreTransaction\Transitions\ConfirmStoreTransactionTransition($this);
        if ($transition->canTransition()) {
            $transition->handle();
            $this->status = new \App\States\StoreTransaction\ProcessingState($this);
            $this->save();
        } else {
            throw new \Exception('Không thể xác nhận giao dịch ở trạng thái hiện tại');
        }
    }

    /**
     * Hủy giao dịch từ trạng thái PENDING - hoàn trả tiền
     * 
     * @return void
     */
    public function cancelPending(): void
    {
        $transition = new \App\States\StoreTransaction\Transitions\CancelPendingStoreTransactionTransition($this);
        if ($transition->canTransition()) {
            $transition->handle();
            $this->status = new \App\States\StoreTransaction\CancelledState($this);
            $this->save();
        } else {
            throw new \Exception('Không thể hủy giao dịch ở trạng thái hiện tại');
        }
    }

    /**
     * Hủy giao dịch từ trạng thái PROCESSING - hoàn trả tiền
     * 
     * @return void
     */
    public function cancel(): void
    {
        $transition = new \App\States\StoreTransaction\Transitions\CancelStoreTransactionTransition($this);
        if ($transition->canTransition()) {
            $newState = $transition->handle();
            $this->status = $newState;
            $this->save();
        } else {
            throw new \Exception($transition->getValidationErrorMessage());
        }
    }

    // Backward Compatibility & Helper Methods (để tương thích với code cũ)
    
    /**
     * Kiểm tra xem giao dịch có thể xác nhận hay không
     * Chỉ giao dịch PENDING mới có thể xác nhận
     * 
     * @return bool
     */
    public function canBeConfirmed(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\PendingState;
    }
    
    /**
     * Kiểm tra xem giao dịch có thể hủy hay không
     * Giao dịch PENDING hoặc PROCESSING mới có thể hủy
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\PendingState ||
               $this->status instanceof \App\States\StoreTransaction\ProcessingState;
    }

    /**
     * Kiểm tra xem có thể chat hay không
     * Chỉ có thể chat khi đang PROCESSING (đã xác nhận)
     * 
     * @return bool
     */
    public function canChat(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\ProcessingState;
    }

    /**
     * Kiểm tra xem đây có phải trạng thái cuối cùng hay không
     * Trạng thái cuối cùng là completed, disputed, cancelled
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return $this->status instanceof \App\States\StoreTransaction\CompletedState ||
               $this->status instanceof \App\States\StoreTransaction\DisputedState ||
               $this->status instanceof \App\States\StoreTransaction\CancelledState;
    }
}
