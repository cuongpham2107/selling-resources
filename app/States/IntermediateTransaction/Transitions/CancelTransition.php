<?php

namespace App\States\IntermediateTransaction\Transitions;

use App\Models\IntermediateTransaction;
use App\Models\WalletTransaction;
use App\States\IntermediateTransaction\CancelledState;
use App\States\IntermediateTransaction\ConfirmedState;
use App\States\IntermediateTransaction\IntermediateTransactionState;
use App\States\IntermediateTransaction\PendingState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Cancel Transition - Hủy giao dịch
 * 
 * Hủy bỏ giao dịch và hoàn tiền cho người mua (nếu đã thanh toán)
 */
class CancelTransition extends Transition
{
    private IntermediateTransaction $transaction;

    public function __construct(IntermediateTransaction $transaction)
    {
        $this->transaction = $transaction;
    }

    /**
     * Handle the transition logic
     * 
     * Xử lý logic chuyển đổi trạng thái
     * 
     * @return IntermediateTransactionState
     */
    public function handle(): IntermediateTransactionState
    {
        DB::transaction(function () {
            // Refund money to buyer if transaction was confirmed
            if ($this->transaction->status instanceof ConfirmedState) {
                $this->refundToBuyer();
            }
            
            // Update transaction cancellation time
            $this->transaction->update([
                'cancelled_at' => now(),
            ]);

            // Log the cancellation
            Log::info("IntermediateTransaction {$this->transaction->id} cancelled by user " . Auth::id());
            
            // Send cancellation notifications
            // event(new TransactionCancelled($this->transaction));
        });

        return new CancelledState($this->transaction);
    }

    /**
     * Refund money to buyer
     * 
     * Hoàn tiền cho người mua
     * 
     * @return void
     */
    private function refundToBuyer(): void
    {
        $buyer = $this->transaction->buyer;
        $refundAmount = $this->transaction->amount;
        
        // Add money back to buyer's wallet
        $buyer->increment('wallet_balance', $refundAmount);

        // Create wallet transaction record for refund
        WalletTransaction::create([
            'customer_id' => $buyer->id,
            'type' => 'credit',
            'transaction_type' => 'refund',
            'amount' => $refundAmount,
            'description' => "Hoàn tiền giao dịch trung gian bị hủy: {$this->transaction->description}",
            'reference_id' => $this->transaction->id,
            'status' => 'completed',
        ]);

        Log::info("Refunded {$refundAmount} to buyer {$buyer->id} for cancelled transaction {$this->transaction->id}");
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
        $currentUser = Auth::guard('customer')->user();
        if (!$currentUser) {
            return false;
        }

        // Chỉ buyer hoặc seller có thể hủy
        $canCancel = $currentUser->id === $this->transaction->buyer_id 
                  || $currentUser->id === $this->transaction->seller_id;
        
        if (!$canCancel) {
            return false;
        }

        // Chỉ có thể hủy từ Pending hoặc Confirmed state
        return $this->transaction->status instanceof PendingState 
            || $this->transaction->status instanceof ConfirmedState;
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
            return 'Bạn cần đăng nhập để thực hiện thao tác này.';
        }

        $canCancel = $currentUser->id === $this->transaction->buyer_id 
                  || $currentUser->id === $this->transaction->seller_id;
        
        if (!$canCancel) {
            return 'Chỉ người mua hoặc người bán mới có thể hủy giao dịch.';
        }

        $validStates = $this->transaction->status instanceof PendingState 
                    || $this->transaction->status instanceof ConfirmedState;
        
        if (!$validStates) {
            return 'Không thể hủy giao dịch ở trạng thái hiện tại.';
        }

        return 'Không thể hủy giao dịch.';
    }
}
