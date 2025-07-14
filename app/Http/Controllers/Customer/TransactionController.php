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
     * 
     * Hiển thị danh sách giao dịch trung gian của customer
     * Logic: Lấy giao dịch mà customer tham gia (buyer hoặc seller), hỗ trợ filter và search
     */
    public function index(Request $request): Response
    {
        // Lấy tất cả giao dịch mà customer tham gia (buyer hoặc seller)
        $query = IntermediateTransaction::where('buyer_id', $this->customer->id)
            ->orWhere('seller_id', $this->customer->id)
            ->with(['buyer', 'seller', 'disputes']);
        
        // Filter theo từ khóa tìm kiếm
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

        // Filter theo trạng thái giao dịch
        if ($request->filled('status')) {
            $query->where('status', $request->get('status'));
        }

        // Filter theo vai trò trong giao dịch
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
     * 
     * Tạo giao dịch trung gian mới
     * Logic: Validate input → Tìm partner → Tính phí → Khóa tiền (nếu buyer) → Tạo transaction
     */
    public function store(Request $request): RedirectResponse
    {
        // Bước 1: Validate đầu vào với message tiếng Việt
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

        // Bước 2: Tìm partner theo username
        $partner = Customer::where('username', $request->partner_username)->first();
        
        if (!$partner) {
            return back()->withErrors(['partner_username' => 'Không tìm thấy người dùng này']);
        }

        // Bước 3: Kiểm tra không thể tạo giao dịch với chính mình
        if ($partner->id === $this->customer->id) {
            return back()->withErrors(['partner_username' => 'Không thể tạo giao dịch với chính mình']);
        }

        // Bước 4: Tính phí giao dịch dựa trên amount và thời hạn
        $fee = $this->calculateTransactionFee($request->amount, $request->duration_hours);
        
        // Bước 5: Kiểm tra số dư nếu customer là buyer
        if ($request->role === 'BUYER') {
            $totalRequired = $request->amount + $fee;
            if ($this->customer->balance->available_balance < $totalRequired) {
                return back()->withErrors(['amount' => 'Số dư không đủ để thực hiện giao dịch này']);
            }
        }

        // Bước 6: Tạo giao dịch trong database transaction
        DB::transaction(function () use ($request, $partner, $fee) {
            
            IntermediateTransaction::create([
                'buyer_id' => $request->role === 'BUYER' ? $this->customer->id : $partner->id,
                'seller_id' => $request->role === 'SELLER' ? $this->customer->id : $partner->id,
                'amount' => $request->amount,
                'fee' => $fee,
                'description' => $request->description,
                'status' => \App\States\IntermediateTransaction\PendingState::class,
                'duration_hours' => $request->duration_hours,
                'expires_at' => now()->addHours($request->duration_hours),
            ]);

            // Bước 7: Nếu customer là buyer, khóa tiền trong ví
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
     * 
     * Tính toán phí giao dịch dựa trên số tiền và thời hạn
     * Logic: Phí cơ bản theo bracket + phí 20% cho mỗi ngày nếu >= 24h
     */
    private function calculateTransactionFee(float $amount, int $durationHours): float
    {
        // Tính phí cơ bản theo bracket amount
        if ($amount < 100000) $baseFee = 4000;           // < 100k: 4k
        elseif ($amount <= 200000) $baseFee = 6000;      // 100k-200k: 6k
        elseif ($amount <= 1000000) $baseFee = 10000;    // 200k-1M: 10k
        elseif ($amount <= 2000000) $baseFee = 16000;    // 1M-2M: 16k
        elseif ($amount <= 5000000) $baseFee = 36000;    // 2M-5M: 36k
        elseif ($amount <= 10000000) $baseFee = 66000;   // 5M-10M: 66k
        elseif ($amount <= 30000000) $baseFee = 150000;  // 10M-30M: 150k
        else $baseFee = 300000;                          // > 30M: 300k

        // Thêm phí 20% cho mỗi ngày nếu giao dịch >= 24 giờ
        if ($durationHours >= 24) {
            $days = ceil($durationHours / 24);
            $baseFee += $baseFee * 0.2 * $days;
        }

        return $baseFee;
    }

    /**
     * Xác nhận giao dịch trung gian
     * Logic: Sử dụng state machine transition ConfirmTransaction
     */
    private function confirmTransaction(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        try {
            // Sử dụng helper method từ model để xác nhận giao dịch
            $transaction->confirm();
            
            return back()->with('success', 'Đã xác nhận giao dịch');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể xác nhận giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Đánh dấu đã gửi hàng
     * Logic: Chỉ seller mới có quyền → sử dụng state machine transition để chuyển trạng thái
     */
    private function markAsShipped(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->seller_id !== $customer->id) {
            return back()->withErrors(['permission' => 'Chỉ người bán mới có thể đánh dấu đã gửi hàng']);
        }

        try {
            // Sử dụng state machine transition để đánh dấu đã gửi hàng
            $transaction->markAsShipped();
            
            return back()->with('success', 'Đã đánh dấu đã gửi hàng');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể đánh dấu đã gửi hàng: ' . $e->getMessage()]);
        }
    }

    /**
     * Đánh dấu đã nhận hàng và hoàn thành giao dịch
     * Logic: Chỉ buyer mới có quyền → chuyển tiền cho seller + tặng điểm cho buyer
     */
    /**
     * Đánh dấu đã nhận hàng (buyer xác nhận)
     * Logic: Chỉ buyer mới có quyền → sử dụng state machine transition để hoàn thành giao dịch
     */
    private function markAsReceived(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        if ($transaction->buyer_id !== $customer->id) {
            return back()->withErrors(['permission' => 'Chỉ người mua mới có thể đánh dấu đã nhận hàng']);
        }

        try {
            // Sử dụng state machine transition để hoàn thành giao dịch
            $transaction->markAsReceived();
            
            return back()->with('success', 'Đã hoàn tất giao dịch');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể hoàn thành giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Tạo tranh chấp cho giao dịch
     * Logic: Validate reason/description → Tạo Dispute → Cập nhật status thành DISPUTED
     */
    /**
     * Tạo tranh chấp cho giao dịch
     * Logic: Validate reason/description → Tạo Dispute → sử dụng state machine transition để chuyển sang trạng thái DISPUTED
     */
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

        try {
            // Xác định đối tác trong giao dịch
            $partner = $transaction->buyer_id === $customer->id ? $transaction->seller : $transaction->buyer;

            // Tạo dispute record
            \App\Models\Dispute::create([
                'transaction_id' => $transaction->id,
                'complainant_id' => $customer->id,     // Người khiếu nại
                'respondent_id' => $partner->id,       // Người bị khiếu nại
                'reason' => $request->reason,
                'description' => $request->description,
                'status' => DisputeStatus::PENDING,
            ]);

            // Sử dụng state machine transition để chuyển sang trạng thái DISPUTED
            $transaction->markAsDisputed();
            
            return back()->with('success', 'Đã tạo tranh chấp. Quản trị viên sẽ xem xét trong thời gian sớm nhất.');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể tạo tranh chấp: ' . $e->getMessage()]);
        }
    }

    /**
     * Hủy giao dịch trung gian
     * Logic: Chỉ có thể hủy khi PENDING → sử dụng state machine transition để hủy giao dịch
     */
    private function cancelTransaction(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
    {
        try {
            // Sử dụng state machine transition để hủy giao dịch
            $transaction->cancel();
            
            return back()->with('success', 'Đã hủy giao dịch');
        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Không thể hủy giao dịch: ' . $e->getMessage()]);
        }
    }

    /**
     * Tính toán điểm thưởng dựa trên số tiền giao dịch
     * Logic: Bracket system - amount càng cao, điểm thưởng càng nhiều
     */
    private function calculatePointsReward(float $amount): int
    {
        if ($amount < 100000) return 2;          // < 100k: 2 điểm
        elseif ($amount <= 200000) return 3;     // 100k-200k: 3 điểm
        elseif ($amount <= 1000000) return 5;    // 200k-1M: 5 điểm
        elseif ($amount <= 2000000) return 8;    // 1M-2M: 8 điểm
        elseif ($amount <= 5000000) return 16;   // 2M-5M: 16 điểm
        elseif ($amount <= 10000000) return 32;  // 5M-10M: 32 điểm
        elseif ($amount <= 30000000) return 75;  // 10M-30M: 75 điểm
        else return 150;                         // > 30M: 150 điểm
    }

    /**
     * Get transaction fee calculation for preview
     */
    public function calculateFee(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:1000',
            'duration_hours' => 'required|integer|min:1|max:8760', // Max 1 năm
        ]);

        $amount = $validated['amount'];
        $durationHours = $validated['duration_hours'];

        $transactionFee = \App\Models\TransactionFee::getApplicableFee($amount);
        
        if (!$transactionFee) {
            return response()->json([
                'error' => 'Không thể tính phí cho số tiền này'
            ], 400);
        }

        // Tính phí cơ bản
        $baseFee = $transactionFee->fee_amount + ($amount * $transactionFee->fee_percentage / 100);
        
        // Thêm phí daily nếu >= 24h
        $finalFee = $baseFee;
        $hasDailyFee = $durationHours >= 24;
        if ($hasDailyFee) {
            $dailyFeePercentage = $transactionFee->daily_fee_percentage / 100;
            $finalFee += $baseFee * $dailyFeePercentage;
        }

        $finalFee = round($finalFee, 2);

        return response()->json([
            'amount' => $amount,
            'duration_hours' => $durationHours,
            'fee_breakdown' => [
                'base_fee' => $baseFee,
                'daily_fee_percentage' => $transactionFee->daily_fee_percentage,
                'has_daily_fee' => $hasDailyFee,
                'daily_fee_amount' => $hasDailyFee ? round($baseFee * $transactionFee->daily_fee_percentage / 100, 2) : 0,
                'total_fee' => $finalFee,
            ],
            'points_reward' => $transactionFee->points_reward,
            'total_amount' => $amount + $finalFee,
        ]);
    }
}
