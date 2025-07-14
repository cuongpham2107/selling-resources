<?php

namespace App\States\IntermediateTransaction\Transitions;

use App\Models\IntermediateTransaction;
use App\States\IntermediateTransaction\ConfirmedState;
use App\States\IntermediateTransaction\IntermediateTransactionState;
use App\States\IntermediateTransaction\SellerSentState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Mark As Shipped Transition - Chuyển từ Confirmed sang SellerSent
 * 
 * Người bán đánh dấu đã gửi hàng cho người mua
 */
class MarkAsShippedTransition extends Transition
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
        // Update transaction shipped time
        $this->transaction->update([
            'seller_sent_at' => now(),
        ]);

        // Log the shipping
        Log::info("IntermediateTransaction {$this->transaction->id} marked as shipped by seller {$this->transaction->seller_id}");

        // Có thể gửi notification cho buyer ở đây
        // event(new TransactionShipped($this->transaction));

        return new SellerSentState($this->transaction);
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
        if (!$currentUser || $currentUser->id !== $this->transaction->seller_id) {
            return false;
        }

        // Kiểm tra trạng thái hiện tại
        return $this->transaction->status instanceof ConfirmedState;
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
        
        if (!$currentUser || $currentUser->id !== $this->transaction->seller_id) {
            return 'Chỉ người bán mới có thể đánh dấu đã gửi hàng.';
        }

        if (!$this->transaction->status instanceof ConfirmedState) {
            return 'Giao dịch phải được xác nhận trước khi có thể đánh dấu đã gửi.';
        }

        return 'Không thể đánh dấu đã gửi hàng.';
    }
}
