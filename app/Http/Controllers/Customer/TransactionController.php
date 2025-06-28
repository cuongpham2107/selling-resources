<?php

namespace App\Http\Controllers\Customer;

use App\Enums\DisputeStatus;
use App\Enums\IntermediateTransactionStatus;
use App\Models\IntermediateTransaction;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class TransactionController extends BaseCustomerController
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request): Response
    {
        $query = IntermediateTransaction::where('buyer_id', $this->customer->id)
            ->orWhere('seller_id', $this->customer->id)
            ->with(['buyer', 'seller', 'disputes']);
        
        // Apply filters
        if ($request->filled('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->whereHas('buyer', function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%");
                })->orWhereHas('seller', function ($q) use ($search) {
                    $q->where('username', 'like', "%{$search}%");
                })->orWhere('id', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->filled('role')) {
            $role = $request->get('role');
            if ($role === 'BUYER') {
                $query->where('buyer_id', $this->customer->id);
            } elseif ($role === 'SELLER') {
                $query->where('seller_id', $this->customer->id);
            }
        }

        $transactions = $query->orderBy('created_at', 'desc')->paginate(10);
        
        return Inertia::render('customer/Transactions/Index', [
            'transactions' => $transactions,
            'filters' => [
                'search' => $request->get('search'),
                'status' => $request->get('status'),
                'role' => $request->get('role'),
            ],
        ]);
    }

    /**
     * Show the form for creating a new transaction.
     */
    public function create(Request $request): Response
    {
        return Inertia::render('customer/Transactions/Create', [
            'customer' => $this->customer,
        ]);
    }

    /**
     * Store a newly created transaction.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:BUYER,SELLER',
            'partner_username' => 'required|string|exists:customers,username',
            'amount' => 'required|numeric|min:1000',
            'description' => 'required|string|max:1000',
            'duration_hours' => 'required|integer|min:1|max:168', // 1 hour to 7 days
        ], [
            'role.required' => 'Vai trò trong giao dịch là bắt buộc.',
            'role.in' => 'Vai trò phải là Người mua hoặc Người bán.',
            'partner_username.required' => 'Tên người giao dịch là bắt buộc.',
            'partner_username.string' => 'Tên người giao dịch phải là chuỗi ký tự.',
            'partner_username.exists' => 'Tên người giao dịch không tồn tại trong hệ thống.',
            'amount.required' => 'Số tiền giao dịch là bắt buộc.',
            'amount.numeric' => 'Số tiền giao dịch phải là một số hợp lệ.',
            'amount.min' => 'Số tiền giao dịch tối thiểu là 1,000 VNĐ.',
            'description.required' => 'Mô tả giao dịch là bắt buộc.',
            'description.string' => 'Mô tả giao dịch phải là chuỗi ký tự.',
            'description.max' => 'Mô tả giao dịch không được vượt quá 1000 ký tự.',
            'duration_hours.required' => 'Thời gian giao dịch là bắt buộc.',
            'duration_hours.integer' => 'Thời gian giao dịch phải là số nguyên.',
            'duration_hours.min' => 'Thời gian giao dịch tối thiểu là 1 giờ.',
            'duration_hours.max' => 'Thời gian giao dịch tối đa là 168 giờ (7 ngày).',
        ]);

        // Find partner
        $partner = Customer::where('username', $request->partner_username)->first();
        
        if (!$partner) {
            return back()->withErrors(['partner_username' => 'Không tìm thấy người dùng này']);
        }

        if ($partner->id === $this->customer->id) {
            return back()->withErrors(['partner_username' => 'Không thể tạo giao dịch với chính mình']);
        }

        // Calculate fee based on amount and duration
        $fee = $this->calculateTransactionFee($request->amount, $request->duration_hours);
        
        // Check balance if customer is buyer
        if ($request->role === 'BUYER') {
            $totalRequired = $request->amount + $fee;
            if (!$this->hasBalance($totalRequired)) {
                return back()->withErrors(['amount' => 'Số dư không đủ để thực hiện giao dịch này']);
            }
        }

        DB::transaction(function () use ($request, $partner, $fee) {
            $transaction = IntermediateTransaction::create([
                'buyer_id' => $request->role === 'BUYER' ? $this->customer->id : $partner->id,
                'seller_id' => $request->role === 'SELLER' ? $this->customer->id : $partner->id,
                'amount' => $request->amount,
                'fee' => $fee,
                'description' => $request->description,
                'status' => IntermediateTransactionStatus::PENDING,
                'duration_hours' => $request->duration_hours,
                'expires_at' => now()->addHours($request->duration_hours),
            ]);

            // Nếu khách hàng là người mua, khấu trừ tiền từ số dư
            if ($request->role === 'BUYER') {
                $this->customer->balance->decrement('balance', $request->amount + $fee);
                $this->customer->balance->increment('locked_balance', $request->amount + $fee);
            }
        });

        return redirect()->route('customer.transactions.index')
            ->with('success', 'Giao dịch đã được tạo thành công. Đang chờ đối tác xác nhận.');
    }

    /**
     * Display the specified transaction.
     */
    public function show(IntermediateTransaction $transaction): Response
    {
        // Check if customer is part of this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền xem giao dịch này');
        }

        $transaction->load(['buyer', 'seller', 'disputes', 'chats']);

        return Inertia::render('customer/Transactions/Show', [
            'transaction' => $transaction,
        ]);
    }

    /**
     * Update the specified transaction.
     */
    public function update(Request $request, IntermediateTransaction $transaction): RedirectResponse
    {
        // Check if customer is part of this transaction
        if ($transaction->buyer_id !== $this->customer->id && $transaction->seller_id !== $this->customer->id) {
            abort(403, 'Bạn không có quyền cập nhật giao dịch này');
        }

        $action = $request->input('action');

        switch ($action) {
            case 'confirm':
                return $this->confirmTransaction($transaction, $this->customer);
            case 'shipped':
                return $this->markAsShipped($transaction, $this->customer);
            case 'received':
                return $this->markAsReceived($transaction, $this->customer);
            case 'dispute':
                return $this->createDispute($transaction, $this->customer, $request);
            case 'cancel':
                return $this->cancelTransaction($transaction, $this->customer);
            default:
                return back()->withErrors(['action' => 'Hành động không hợp lệ']);
        }
    }

    /**
     * Calculate transaction fee based on amount and duration
     */
    private function calculateTransactionFee(float $amount, int $durationHours): float
    {
        // Base fee calculation
        if ($amount < 100000) $baseFee = 4000;
        elseif ($amount <= 200000) $baseFee = 6000;
        elseif ($amount <= 1000000) $baseFee = 10000;
        elseif ($amount <= 2000000) $baseFee = 16000;
        elseif ($amount <= 5000000) $baseFee = 36000;
        elseif ($amount <= 10000000) $baseFee = 66000;
        elseif ($amount <= 30000000) $baseFee = 150000;
        else $baseFee = 300000;

        // Add 20% per day for transactions >= 24 hours
        if ($durationHours >= 24) {
            $days = ceil($durationHours / 24);
            $baseFee += $baseFee * 0.2 * $days;
        }

        return $baseFee;
    }

    private function confirmTransaction(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->status !== IntermediateTransactionStatus::PENDING) {
            return back()->withErrors(['status' => 'Giao dịch không thể xác nhận']);
        }

        $transaction->update([
            'status' => IntermediateTransactionStatus::CONFIRMED,
            'confirmed_at' => now(),
        ]);
        
        return back()->with('success', 'Đã xác nhận giao dịch');
    }

    private function markAsShipped(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->seller_id !== $customer->id) {
            return back()->withErrors(['permission' => 'Chỉ người bán mới có thể đánh dấu đã gửi hàng']);
        }

        $transaction->update(['seller_sent_at' => now()]);
        
        return back()->with('success', 'Đã đánh dấu đã gửi hàng');
    }

    private function markAsReceived(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->buyer_id !== $customer->id) {
            return back()->withErrors(['permission' => 'Chỉ người mua mới có thể đánh dấu đã nhận hàng']);
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update([
                'buyer_received_at' => now(),
                'status' => IntermediateTransactionStatus::COMPLETED,
                'completed_at' => now(),
            ]);

            // Release money to seller
            $seller = $transaction->seller;
            $seller->balance->increment('balance', $transaction->amount);
            
            // Give points to buyer
            $pointsReward = $this->calculatePointsReward($transaction->amount);
            $buyer = $transaction->buyer;
            $buyer->points->increment('points', $pointsReward);
            $buyer->points->increment('total_earned', $pointsReward);
        });
        
        return back()->with('success', 'Đã hoàn tất giao dịch');
    }

    private function createDispute(IntermediateTransaction $transaction, Customer $customer, Request $request): RedirectResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'description' => 'required|string|max:1000',
        ], [
            'reason.required' => 'Lý do khiếu nại là bắt buộc.',
            'reason.string' => 'Lý do khiếu nại phải là chuỗi ký tự.',
            'reason.max' => 'Lý do khiếu nại không được vượt quá 500 ký tự.',
            'description.required' => 'Mô tả chi tiết khiếu nại là bắt buộc.',
            'description.string' => 'Mô tả chi tiết khiếu nại phải là chuỗi ký tự.',
            'description.max' => 'Mô tả chi tiết khiếu nại không được vượt quá 1000 ký tự.',
        ]);

        $partner = $transaction->buyer_id === $customer->id ? $transaction->seller : $transaction->buyer;

        \App\Models\Dispute::create([
            'transaction_id' => $transaction->id,
            'complainant_id' => $customer->id,
            'respondent_id' => $partner->id,
            'reason' => $request->reason,
            'description' => $request->description,
            'status' => DisputeStatus::PENDING,
        ]);

        $transaction->update(['status' => IntermediateTransactionStatus::DISPUTED]);
        
        return back()->with('success', 'Đã tạo tranh chấp. Quản trị viên sẽ xem xét trong thời gian sớm nhất.');
    }

    private function cancelTransaction(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->status !== IntermediateTransactionStatus::PENDING) {
            return back()->withErrors(['status' => 'Giao dịch không thể hủy']);
        }

        DB::transaction(function () use ($transaction) {
            $transaction->update(['status' => IntermediateTransactionStatus::CANCELLED]);

            // Refund money to buyer if money was held
            if ($transaction->buyer->balance->pending_amount >= $transaction->amount + $transaction->fee) {
                $transaction->buyer->balance->decrement('pending_amount', $transaction->amount + $transaction->fee);
                $transaction->buyer->balance->increment('balance', $transaction->amount + $transaction->fee);
            }
        });
        
        return back()->with('success', 'Đã hủy giao dịch');
    }

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
}
