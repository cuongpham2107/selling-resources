<?php

namespace App\States\IntermediateTransaction\Transitions;

use App\Models\IntermediateTransaction;
use App\States\IntermediateTransaction\ConfirmedState;
use App\States\IntermediateTransaction\IntermediateTransactionState;
use App\States\IntermediateTransaction\PendingState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Confirm Transition - Chuyển từ Pending sang Confirmed
 * 
 * Người mua xác nhận giao dịch sau khi đã kiểm tra thông tin
 */
class ConfirmTransition extends Transition
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
        // Before transition - Send notification
        // có thể gửi notification hoặc event ở đây
        
        // Update transaction confirmation time
        $this->transaction->update([
            'confirmed_at' => now(),
        ]);

        // Log the confirmation
        Log::info("IntermediateTransaction {$this->transaction->id} confirmed by buyer {$this->transaction->buyer_id}");

        // After transition - có thể thêm các logic khác
        // Ví dụ: gửi email thông báo cho seller

        return new ConfirmedState($this->transaction);
    }

    /**
     * Check if the transition can be performed
     * 
     * Kiểm tra xem có thể thực hiện chuyển đổi hay không
     * 
     * @return bool
     */
    //lỗi 
    public function canTransition(): bool
    {
        // Kiểm tra user permission
        $currentUser = Auth::guard('customer')->user();
        dd($currentUser, !$currentUser || $currentUser->id !== $this->transaction->buyer_id);
        if (!$currentUser || $currentUser->id !== $this->transaction->buyer_id) {
            return false;
        }
        // Kiểm tra trạng thái hiện tại
        return $this->transaction->status instanceof PendingState;
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
        
        if (!$currentUser || $currentUser->id !== $this->transaction->buyer_id) {
            return 'Chỉ người mua mới có thể xác nhận giao dịch.';
        }

        if (!$this->transaction->status instanceof PendingState) {
            return 'Giao dịch không ở trạng thái có thể xác nhận.';
        }

        return 'Không thể xác nhận giao dịch.';
    }
}
