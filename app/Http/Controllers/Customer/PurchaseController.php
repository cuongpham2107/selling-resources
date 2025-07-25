<?php

namespace App\Http\Controllers\Customer;

use App\Models\StoreTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseController extends BaseCustomerController
{
    /**
     * Display a listing of the customer's purchases (store transactions where they are the buyer).
     */
    public function index(Request $request)
    {
        $transactions = StoreTransaction::where(function($query) {
            $query->where('buyer_id', $this->customer->id)
                  ->orWhere('seller_id', $this->customer->id);
        })
            ->with(['buyer:id,username', 'seller:id,username', 'product:id,name,price,images'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Transform data for frontend using the same logic as StoreTransactionController
        $transactions->getCollection()->transform(function ($transaction) {
            return $this->transformTransactionForFrontend($transaction);
        });
        return Inertia::render('customer/Store/Transactions', [
            'transactions' => $transactions,
            'currentUser' => $this->customer,
            'pageTitle' => 'Danh sách mua hàng',
            'pageDescription' => 'Quản lý các giao dịch mua hàng của bạn',
            'showOnlyPurchases' => true, // Flag để frontend biết đây là trang mua hàng
        ]);
    }

    /**
     * Transform transaction data for frontend (same as StoreTransactionController)
     */
    private function transformTransactionForFrontend(StoreTransaction $transaction): array
    {
        /** @var \App\States\StoreTransaction\StoreTransactionState $statusState */
        $statusState = $transaction->status;
        
        return [
            'id' => $transaction->id,
            'transaction_code' => $transaction->transaction_code,
            'amount' => $transaction->amount,
            'fee' => $transaction->fee,
            'total_amount' => $transaction->amount + $transaction->fee,
            'seller_receive_amount' => $transaction->amount - $transaction->fee,
            'description' => $transaction->description,
            'created_at' => $transaction->created_at,
            'updated_at' => $transaction->updated_at,
            'completed_at' => $transaction->completed_at,
            'confirmed_at' => $transaction->confirmed_at,
            'cancelled_at' => $transaction->cancelled_at,
            'auto_complete_at' => $transaction->auto_complete_at,
            
            // Status information
            'status' => get_class($statusState),
            'status_label' => $statusState->getLabel(),
            'status_color' => $statusState->getColor(),
            
            // User roles
            'is_buyer' => $transaction->buyer_id === $this->customer->id,
            'is_seller' => $transaction->seller_id === $this->customer->id,
            
            // Permissions based on current state
            'permissions' => [
                'can_confirm' => $transaction->canBeConfirmed() && $transaction->seller_id === $this->customer->id,
                'can_cancel' => $transaction->canBeCancelled(),
                'can_complete' => $transaction->canBeCompleted() && $transaction->buyer_id === $this->customer->id,
                'can_dispute' => $transaction->canBeDisputed(),
                'can_chat' => $transaction->canChat(),
            ],
            
            // Related data
            'buyer' => $transaction->buyer,
            'seller' => $transaction->seller,
            'product' => $transaction->product,
        ];
    }
}