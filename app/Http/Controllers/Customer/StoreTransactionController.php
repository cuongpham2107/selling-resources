<?php

namespace App\Http\Controllers\Customer;

use App\Models\StoreTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class StoreTransactionController extends BaseCustomerController
{
    /**
     * Display a listing of store transactions
     */
    public function index(): Response
    {
        $transactions = StoreTransaction::where(function($query) {
                $query->where('buyer_id', $this->customer->id)
                      ->orWhere('seller_id', $this->customer->id);
            })
            ->with(['buyer:id,username', 'seller:id,username', 'product:id,name,price,images'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Transform data for frontend
        $transactions->getCollection()->transform(function ($transaction) {
            return $this->transformTransactionForFrontend($transaction);
        });

        return Inertia::render('customer/Store/Transactions', [
            'transactions' => $transactions,
            'currentUser' => $this->customer,
        ]);
    }

    /**
     * Show the specified transaction
     */
    public function show(StoreTransaction $transaction): Response
    {
        // Check if user is involved in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        $transaction->load([
            'buyer:id,username,wallet_balance',
            'seller:id,username',
            'product:id,name,description,price,images',
            'product.store:id,store_name',
            'chats.sender:id,username',
            'disputes'
        ]);

        // Transform transaction data for frontend
        $transactionData = $this->transformTransactionForFrontend($transaction);

        return Inertia::render('customer/Store/TransactionDetail', [
            'transaction' => $transactionData,
            'currentUser' => $this->customer,
        ]);
    }

    /**
     * Complete transaction (buyer confirms receipt)
     * Logic: Sử dụng state machine transition để hoàn thành giao dịch cửa hàng
     */
    public function complete(Request $request, StoreTransaction $transaction)
    {
        // Only buyer can complete
        if ($transaction->buyer_id !== $this->customer->id) {
            abort(403);
        }

        try {
            // Sử dụng state machine transition để hoàn thành giao dịch
            $transaction->complete();

            return back()->with('success', 'Giao dịch đã được hoàn thành thành công!');

        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi hoàn thành giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Create dispute for transaction
     * Logic: Validate reason/description → Tạo Dispute → sử dụng state machine transition để chuyển sang trạng thái DISPUTED
     */
    public function dispute(Request $request, StoreTransaction $transaction)
    {
        // Check if user is involved in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:not_received,wrong_item,damaged,scam,other'],
            'description' => ['required', 'string', 'max:1000'],
            'evidence' => ['nullable', 'array'],
            'evidence.*' => ['image', 'max:5120'], // 5MB max per image
        ], [
            'reason.required' => 'Lý do khiếu nại là bắt buộc.',
            'reason.in' => 'Lý do khiếu nại không hợp lệ.',
            'description.required' => 'Mô tả chi tiết là bắt buộc.',
            'description.max' => 'Mô tả không được vượt quá 1000 ký tự.',
            'evidence.*.image' => 'Bằng chứng phải là hình ảnh.',
            'evidence.*.max' => 'Mỗi hình ảnh không được vượt quá 5MB.',
        ]);

        try {
            // Upload evidence images
            $evidenceFiles = [];
            if ($request->hasFile('evidence')) {
                foreach ($request->file('evidence') as $file) {
                    $evidenceFiles[] = $file->store('dispute-evidence', 'public');
                }
            }

            // Create dispute
            $dispute = \App\Models\Dispute::create([
                'transaction_id' => $transaction->id,
                'transaction_type' => 'store',
                'complainant_id' => $this->customer->id,
                'respondent_id' => $transaction->buyer_id === $this->customer->id 
                    ? $transaction->seller_id 
                    : $transaction->buyer_id,
                'reason' => $validated['reason'],
                'description' => $validated['description'],
                'evidence' => json_encode($evidenceFiles),
                'status' => 'open',
            ]);

            // Sử dụng state machine transition để chuyển sang trạng thái DISPUTED
            $transaction->markAsDisputed();

            return redirect()->route('customer.disputes.show', $dispute)
                ->with('success', 'Khiếu nại đã được tạo thành công. Chúng tôi sẽ xem xét trong vòng 24 giờ.');

        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi tạo khiếu nại: ' . $e->getMessage()]);
        }
    }

    /**
     * Xác nhận giao dịch từ người bán (chuyển từ PENDING sang PROCESSING)
     */
    public function confirm(StoreTransaction $transaction)
    {
        // Kiểm tra quyền: chỉ người bán mới có thể xác nhận
        if ($transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        // Kiểm tra trạng thái: chỉ có thể xác nhận khi đang PENDING
        if (!$transaction->canBeConfirmed()) {
            return back()->withErrors(['message' => 'Giao dịch không thể xác nhận ở trạng thái hiện tại.']);
        }

        try {
            // Sử dụng state machine để chuyển trạng thái
            $transaction->confirm();

            return back()->with('success', 'Đã xác nhận giao dịch thành công.');

        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi xác nhận giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Hủy giao dịch cửa hàng
     */
    public function cancel(StoreTransaction $transaction)
    {
        // Kiểm tra quyền: cả buyer và seller đều có thể hủy
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        // Kiểm tra trạng thái: chỉ có thể hủy khi PENDING hoặc PROCESSING
        if (!$transaction->canBeCancelled()) {
            return back()->withErrors(['message' => 'Giao dịch không thể hủy ở trạng thái hiện tại.']);
        }

        try {
            // Xử lý hủy tùy theo trạng thái hiện tại
            if ($transaction->status instanceof \App\States\StoreTransaction\PendingState) {
                // Hủy từ PENDING: sử dụng transition riêng để hoàn tiền
                $transaction->cancelPending();
            } else {
                // Hủy từ PROCESSING: sử dụng transition thông thường
                $transaction->cancel();
            }

            return back()->with('success', 'Đã hủy giao dịch thành công.');

        } catch (\Exception $e) {
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi hủy giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Transform transaction data for frontend
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
