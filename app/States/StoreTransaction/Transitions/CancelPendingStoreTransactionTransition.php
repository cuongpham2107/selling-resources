<?php

namespace App\States\StoreTransaction\Transitions;

use App\Models\StoreTransaction;
use App\States\StoreTransaction\PendingState;
use App\States\StoreTransaction\CancelledState;
use Spatie\ModelStates\Transition;

/**
 * Chuyển trạng thái từ "Chờ xác nhận" sang "Đã hủy"
 * Transition from PENDING to CANCELLED state
 */
class CancelPendingStoreTransactionTransition extends Transition
{
    private StoreTransaction $storeTransaction;

    public function __construct(StoreTransaction $storeTransaction)
    {
        $this->storeTransaction = $storeTransaction;
    }

    /**
     * Trạng thái nguồn: Chờ xác nhận
     */
    public function from(): string
    {
        return PendingState::class;
    }

    /**
     * Trạng thái đích: Đã hủy
     */
    public function to(): string
    {
        return CancelledState::class;
    }

    /**
     * Thực hiện chuyển trạng thái
     * Hoàn trả tiền và ghi log
     */
    public function handle(): StoreTransaction
    {
        // Hoàn trả điểm cho người mua khi hủy đơn PENDING
        $buyer = $this->storeTransaction->buyer;
        $buyerPoints = $buyer->points(); // Lấy CustomerPoint relation
        
        if ($buyerPoints) {
            $buyerPoints->increment('points', $this->storeTransaction->amount);
        }

        // Cập nhật thời gian hủy
        $this->storeTransaction->cancelled_at = now();
        $this->storeTransaction->save();

        // Log the transition
        logger()->info("StoreTransaction {$this->storeTransaction->id} cancelled from PENDING state", [
            'transaction_id' => $this->storeTransaction->id,
            'seller_id' => $this->storeTransaction->seller_id,
            'buyer_id' => $this->storeTransaction->buyer_id,
            'amount' => $this->storeTransaction->amount,
            'refunded_points' => $this->storeTransaction->amount,
            'cancelled_at' => $this->storeTransaction->cancelled_at,
        ]);

        return $this->storeTransaction;
    }
}
