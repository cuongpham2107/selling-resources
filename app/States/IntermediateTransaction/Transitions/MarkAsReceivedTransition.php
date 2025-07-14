<?php

namespace App\States\IntermediateTransaction\Transitions;

use App\Models\IntermediateTransaction;
use App\Models\WalletTransaction;
use App\States\IntermediateTransaction\CompletedState;
use App\States\IntermediateTransaction\IntermediateTransactionState;
use App\States\IntermediateTransaction\SellerSentState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Mark As Received Transition - Chuyển từ SellerSent sang Completed
 * 
 * Người mua xác nhận đã nhận được hàng và hoàn thành giao dịch
 * Bao gồm việc chuyển tiền cho người bán và xử lý referral bonus
 */
class MarkAsReceivedTransition extends Transition
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
            // Transfer money to seller (minus fee)
            $this->transferMoneyToSeller();
            
            // Process referral bonus nếu có
            $this->processReferralBonus();
            
            // Update transaction completion time
            $this->transaction->update([
                'completed_at' => now(),
                'buyer_received_at' => now(),
            ]);

            // Log the completion
            Log::info("IntermediateTransaction {$this->transaction->id} completed - buyer received goods");
            
            // Send completion notifications
            // event(new TransactionCompleted($this->transaction));
        });

        return new CompletedState($this->transaction);
    }

    /**
     * Transfer money to seller (full amount - fee already paid by buyer)
     * 
     * Chuyển tiền cho người bán (đủ amount - phí đã được buyer trả từ đầu)
     * 
     * @return void
     */
    private function transferMoneyToSeller(): void
    {
        // Người bán nhận đủ amount, phí đã được buyer trả từ đầu
        $sellerReceiveAmount = $this->transaction->amount;
        
        $seller = $this->transaction->seller;
        $seller->increment('wallet_balance', $sellerReceiveAmount);

        // Create wallet transaction record for seller
        WalletTransaction::create([
            'customer_id' => $seller->id,
            'type' => 'credit',
            'transaction_type' => 'intermediate_sale',
            'amount' => $sellerReceiveAmount,
            'description' => "Bán sản phẩm trung gian: {$this->transaction->description}",
            'reference_id' => $this->transaction->id,
            'status' => 'completed',
        ]);

        Log::info("Transferred {$sellerReceiveAmount} to seller {$seller->id} for transaction {$this->transaction->id}");
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
            
            // Lấy point reward từ transaction fee config (100% như buyer)
            $pointsReward = $this->transaction->getPointsReward();
            
            if ($pointsReward > 0) {
                // Add points to referrer (100% số point như buyer nhận được)
                $referrer->increment('points', $pointsReward);
                
                // Create point transaction record
                \App\Models\PointTransaction::create([
                    'customer_id' => $referrer->id,
                    'type' => 'referral_bonus',
                    'amount' => $pointsReward,
                    'balance_after' => $referrer->fresh()->points,
                    'description' => "Thưởng giới thiệu từ giao dịch của {$buyer->username}",
                    'related_customer_id' => $buyer->id,
                ]);

                Log::info("Processed referral bonus {$pointsReward} points for referrer {$referrer->id}");
            }
        }
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
        return $this->transaction->status instanceof SellerSentState;
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
            return 'Chỉ người mua mới có thể xác nhận đã nhận hàng.';
        }

        if (!$this->transaction->status instanceof SellerSentState) {
            return 'Người bán phải gửi hàng trước khi bạn có thể xác nhận nhận hàng.';
        }

        return 'Không thể xác nhận đã nhận hàng.';
    }
}
