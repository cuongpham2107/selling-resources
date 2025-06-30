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

        return Inertia::render('customer/Store/TransactionDetail', [
            'transaction' => $transaction,
            'currentUser' => $this->customer,
            'isBuyer' => $transaction->buyer_id === $this->customer->id,
            'isSeller' => $transaction->seller_id === $this->customer->id,
        ]);
    }

    /**
     * Complete transaction (buyer confirms receipt)
     */
    public function complete(Request $request, StoreTransaction $transaction)
    {
        // Only buyer can complete
        if ($transaction->buyer_id !== $this->customer->id) {
            abort(403);
        }

        // Check if transaction can be completed
        if (!$transaction->canBeCompleted()) {
            return back()->withErrors(['message' => 'Giao dịch không thể hoàn thành.']);
        }

        try {
            DB::beginTransaction();

            // Update transaction status
            $transaction->update([
                'status' => 'completed',
                'completed_at' => now(),
                'buyer_early_complete' => true,
            ]);

            // Transfer money to seller (minus fee)
            $sellerReceiveAmount = $transaction->amount - $transaction->fee;
            
            $seller = $transaction->seller;
            $seller->increment('wallet_balance', $sellerReceiveAmount);

            // Create wallet transaction for seller
            \App\Models\WalletTransaction::create([
                'customer_id' => $seller->id,
                'type' => 'credit',
                'transaction_type' => 'store_sale',
                'amount' => $sellerReceiveAmount,
                'description' => "Bán sản phẩm: {$transaction->product->name}",
                'reference_id' => $transaction->id,
                'status' => 'completed',
            ]);

            DB::commit();

            return back()->with('success', 'Giao dịch đã được hoàn thành thành công!');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi hoàn thành giao dịch.']);
        }
    }

    /**
     * Create dispute for transaction
     */
    public function dispute(Request $request, StoreTransaction $transaction)
    {
        // Check if user is involved in this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403);
        }

        // Check if transaction can be disputed
        if (!$transaction->canBeDisputed()) {
            return back()->withErrors(['message' => 'Giao dịch không thể khiếu nại.']);
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
            DB::beginTransaction();

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

            // Update transaction status
            $transaction->update(['status' => 'disputed']);

            DB::commit();

            return redirect()->route('customer.disputes.show', $dispute)
                ->with('success', 'Khiếu nại đã được tạo thành công. Chúng tôi sẽ xem xét trong vòng 24 giờ.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['message' => 'Có lỗi xảy ra khi tạo khiếu nại.']);
        }
    }
}
