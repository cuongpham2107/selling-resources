<?php

namespace App\States\StoreTransaction\Transitions;

use App\Models\StoreTransaction;
use App\Models\WalletTransaction;
use App\States\StoreTransaction\CompletedState;
use App\States\StoreTransaction\ProcessingState;
use App\States\StoreTransaction\StoreTransactionState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Complete Store Transaction Transition - Hoàn thành giao dịch cửa hàng
 * 
 * Người mua xác nhận đã nhận được sản phẩm từ cửa hàng
 * Chuyển tiền cho người bán và xử lý referral bonus
 */
class CompleteStoreTransactionTransition extends Transition
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
            // Transfer money to seller (minus fee)
            $this->transferMoneyToSeller();
            
            // Process referral bonus nếu có
            $this->processReferralBonus();
            
            // Update transaction completion time
            $this->transaction->update([
                'completed_at' => now(),
                'buyer_early_complete' => true,
            ]);

            // Log the completion
            Log::info("StoreTransaction {$this->transaction->id} completed by buyer {$this->transaction->buyer_id}");
            
            // Send completion notifications
            // event(new StoreTransactionCompleted($this->transaction));
        });

        return new CompletedState($this->transaction);
    }

    /**
     * Transfer money to seller (minus 1% platform fee for store transactions)
     * 
     * Chuyển tiền cho người bán (trừ 1% phí platform cho giao dịch cửa hàng)
     * 
     * @return void
     */
    private function transferMoneyToSeller(): void
    {
        // Store transaction: phí 1% được trừ từ người bán
        $feePercentage = \App\Models\SystemSetting::getValue('store_transaction_fee_percentage', 1);
        $sellerReceiveAmount = $this->transaction->amount * (100 - $feePercentage) / 100;
        
        $seller = $this->transaction->seller;
        $seller->increment('wallet_balance', $sellerReceiveAmount);

        // Create wallet transaction record for seller
        WalletTransaction::create([
            'customer_id' => $seller->id,
            'type' => 'credit',
            'transaction_type' => 'store_sale',
            'amount' => $sellerReceiveAmount,
            'description' => "Bán sản phẩm: {$this->transaction->product->name}",
            'reference_id' => $this->transaction->id,
            'status' => 'completed',
        ]);

        Log::info("Transferred {$sellerReceiveAmount} to seller {$seller->id} for store transaction {$this->transaction->id}");
    }

    /**
     * Process referral bonus cho buyer (nếu có)
     * 
     * Xử lý thưởng giới thiệu cho người mua - 100% số point như buyer nhận được
     * 
     * @return void
     */
    private function processReferralBonus(): void
    {
        $buyer = $this->transaction->buyer;
        
        // Kiểm tra xem buyer có được giới thiệu không
        if ($buyer->referrer_id) {
            $referrer = $buyer->referrer;
            
            // Lấy point reward từ transaction amount (store transaction cũng có point reward)
            $pointsReward = $this->calculatePointsReward($this->transaction->amount);
            
            if ($pointsReward > 0) {
                // Add points to referrer (100% số point như buyer nhận được)
                $referrer->increment('points', $pointsReward);
                
                // Create point transaction record
                \App\Models\PointTransaction::create([
                    'customer_id' => $referrer->id,
                    'type' => 'referral_bonus',
                    'amount' => $pointsReward,
                    'balance_after' => $referrer->fresh()->points,
                    'description' => "Thưởng giới thiệu từ mua hàng của {$buyer->username}",
                    'related_customer_id' => $buyer->id,
                ]);

                Log::info("Processed referral bonus {$pointsReward} points for referrer {$referrer->id} (store transaction)");
            }
        }
    }

    /**
     * Calculate points reward based on transaction amount
     * 
     * @param float $amount
     * @return int
     */
    private function calculatePointsReward(float $amount): int
    {
        if ($amount < 100000) return 2;
        elseif ($amount <= 200000) return 3;
        elseif ($amount <= 1000000) return 5;
        elseif ($amount <= 2000000) return 8;
        elseif ($amount <= 5000000) return 16;
        elseif ($amount <= 10000000) return 32;
        elseif ($amount <= 30000000) return 75;
        else return 150;
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
        if (!$currentUser || $currentUser->id !== $this->transaction->buyer_id) {
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
        
        if (!$currentUser || $currentUser->id !== $this->transaction->buyer_id) {
            return 'Chỉ người mua mới có thể hoàn thành giao dịch.';
        }

        if (!$this->transaction->status instanceof ProcessingState) {
            return 'Giao dịch không ở trạng thái có thể hoàn thành.';
        }

        return 'Không thể hoàn thành giao dịch.';
    }
}
