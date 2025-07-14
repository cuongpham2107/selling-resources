<?php

namespace App\States\StoreTransaction\Transitions;

use App\Models\StoreTransaction;
use App\States\StoreTransaction\PendingState;
use App\States\StoreTransaction\ProcessingState;
use Spatie\ModelStates\Transition;

/**
 * Chuyển trạng thái từ "Chờ xác nhận" sang "Đang giao dịch"
 * Transition from PENDING to PROCESSING state
 */
class ConfirmStoreTransactionTransition extends Transition
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
     * Trạng thái đích: Đang giao dịch
     */
    public function to(): string
    {
        return ProcessingState::class;
    }

    /**
     * Thực hiện chuyển trạng thái
     * Ghi log và cập nhật thời gian xác nhận
     */
    public function handle(): StoreTransaction
    {
        $this->storeTransaction->confirmed_at = now();
        $this->storeTransaction->save();

        // Log the transition
        logger()->info("StoreTransaction {$this->storeTransaction->id} confirmed by seller", [
            'transaction_id' => $this->storeTransaction->id,
            'seller_id' => $this->storeTransaction->seller_id,
            'buyer_id' => $this->storeTransaction->buyer_id,
            'amount' => $this->storeTransaction->amount,
            'confirmed_at' => $this->storeTransaction->confirmed_at,
        ]);

        return $this->storeTransaction;
    }
}
