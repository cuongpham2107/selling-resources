<?php

namespace App\States\StoreTransaction\Transitions;

use App\Models\StoreTransaction;
use App\States\StoreTransaction\DisputedState;
use App\States\StoreTransaction\ProcessingState;
use App\States\StoreTransaction\StoreTransactionState;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Spatie\ModelStates\Transition;

/**
 * Dispute Store Transaction Transition - Tạo tranh chấp cho giao dịch cửa hàng
 * 
 * Tạo tranh chấp khi có vấn đề với sản phẩm hoặc dịch vụ
 */
class DisputeStoreTransactionTransition extends Transition
{
    private StoreTransaction $transaction;
    private array $disputeData;

    public function __construct(StoreTransaction $transaction, array $disputeData = [])
    {
        $this->transaction = $transaction;
        $this->disputeData = $disputeData;
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
            // Create dispute record
            $this->createDispute();
            
            // Update transaction dispute time
            $this->transaction->update([
                'disputed_at' => now(),
            ]);

            // Log the dispute
            Log::info("StoreTransaction {$this->transaction->id} disputed by user " . Auth::id());
            
            // Send dispute notifications
            // event(new StoreTransactionDisputed($this->transaction));
        });

        return new DisputedState($this->transaction);
    }

    /**
     * Create dispute record
     * 
     * Tạo bản ghi tranh chấp
     * 
     * @return void
     */
    private function createDispute(): void
    {
        $currentUser = Auth::guard('customer')->user();
        
        // Determine who is the complainant and respondent
        $complainantId = $currentUser->id;
        $respondentId = $currentUser->id === $this->transaction->buyer_id 
            ? $this->transaction->seller_id 
            : $this->transaction->buyer_id;

        \App\Models\Dispute::create([
            'transaction_id' => $this->transaction->id,
            'transaction_type' => 'store',
            'complainant_id' => $complainantId,
            'respondent_id' => $respondentId,
            'reason' => $this->disputeData['reason'] ?? 'other',
            'description' => $this->disputeData['description'] ?? 'Tranh chấp giao dịch cửa hàng',
            'evidence' => isset($this->disputeData['evidence']) ? json_encode($this->disputeData['evidence']) : null,
            'status' => 'open',
        ]);

        Log::info("Created dispute for store transaction {$this->transaction->id}");
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

        // Chỉ buyer hoặc seller có thể tạo tranh chấp
        $canDispute = $currentUser->id === $this->transaction->buyer_id 
                   || $currentUser->id === $this->transaction->seller_id;
        
        if (!$canDispute) {
            return false;
        }

        // Chỉ có thể tranh chấp từ Processing state
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
            return 'Bạn cần đăng nhập để thực hiện thao tác này.';
        }

        $canDispute = $currentUser->id === $this->transaction->buyer_id 
                   || $currentUser->id === $this->transaction->seller_id;
        
        if (!$canDispute) {
            return 'Chỉ người mua hoặc người bán mới có thể tạo tranh chấp.';
        }

        if (!$this->transaction->status instanceof ProcessingState) {
            return 'Không thể tạo tranh chấp ở trạng thái hiện tại.';
        }

        return 'Không thể tạo tranh chấp.';
    }
}
