<?php

namespace App\States\StoreTransaction\Transitions;

use App\Models\StoreTransaction;
use App\Models\WalletTransaction;
use App\States\StoreTransaction\CancelledState;
use App\States\StoreTransaction\ProcessingState;
use App\States\StoreTransaction\StoreTransactionState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Cancel Store Transaction Transition - Hủy giao dịch cửa hàng từ PROCESSING
 * 
 * Hủy giao dịch đang trong quá trình xử lý và hoàn tiền cho người mua
 */
class CancelStoreTransactionTransition extends Transition
{
    private StoreTransaction $transaction;

    public function __construct(StoreTransaction $transaction)
    {
        $this->transaction = $transaction;
    }

    /**
     * Handle the transition logic
     * 
     * Xử lý logic chuyển đổi trạng thái
     * 
     * @return StoreTransactionState
     */
    public function handle(): StoreTransactionState
    {
        DB::transaction(function () {
            // Hoàn tiền cho buyer (full amount + fee)
            $this->refundToBuyer();
            
            // Update transaction cancellation time
            $this->transaction->update([
                'cancelled_at' => now(),
            ]);

            // Log the cancellation
            Log::info("StoreTransaction {$this->transaction->id} cancelled from PROCESSING state");
        });

        return new CancelledState($this->transaction);
    }

    /**
     * Refund money to buyer (full amount + fee)
     * 
     * Hoàn tiền cho người mua (đủ amount + fee)
     * 
     * @return void
     */
    private function refundToBuyer(): void
    {
        $refundAmount = $this->transaction->amount + $this->transaction->fee;
        $buyer = $this->transaction->buyer;
        
        // Cập nhật số dư buyer
        $buyer->balance->increment('balance', $refundAmount);
    
        // Giảm locked balance nếu có
        if ($buyer->balance) {
            $buyer->balance->decrement('locked_balance', $refundAmount);
        }

        // Create wallet transaction record for buyer
        WalletTransaction::create([
            'customer_id' => $buyer->id,
            'type' => 'credit',
            'transaction_type' => 'store_refund',
            'amount' => $refundAmount,
            'description' => "Hoàn tiền giao dịch cửa hàng bị hủy #{$this->transaction->transaction_code}",
            'reference_id' => $this->transaction->id,
            'status' => 'completed',
        ]);

        Log::info("Refunded {$refundAmount} to buyer {$buyer->id} for cancelled store transaction {$this->transaction->id}");
    }

    /**
     * Check if the transition can be performed
     * 
     * Kiểm tra xem có thể thực hiện chuyển đổi hay không
     * 
     * @return bool
     */
    public function canTransition(): bool
    {
        // Kiểm tra user permission
        $currentUser = Auth::guard('customer')->user();
        if (!$currentUser) {
            return false;
        }

        // Cả buyer và seller đều có thể hủy
        if ($currentUser->id !== $this->transaction->buyer_id && 
            $currentUser->id !== $this->transaction->seller_id) {
            return false;
        }

        // Kiểm tra trạng thái hiện tại
        return $this->transaction->status instanceof ProcessingState;
    }

    /**
     * Get validation error message
     * 
     * Lấy thông báo lỗi validation
     * 
     * @return string
     */
    public function getValidationErrorMessage(): string
    {
        $currentUser = Auth::guard('customer')->user();
        
        if (!$currentUser) {
            return 'Bạn cần đăng nhập để thực hiện hành động này.';
        }

        if ($currentUser->id !== $this->transaction->buyer_id && 
            $currentUser->id !== $this->transaction->seller_id) {
            return 'Bạn không có quyền hủy giao dịch này.';
        }

        if (!$this->transaction->status instanceof ProcessingState) {
            return 'Giao dịch không thể hủy ở trạng thái hiện tại.';
        }

        return 'Không thể hủy giao dịch.';
    }
}