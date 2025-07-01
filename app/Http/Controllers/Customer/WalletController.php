<?php

namespace App\Http\Controllers\Customer;

use App\Models\CustomerBalance;
use App\Models\WalletTransaction;
use App\Services\VnpayService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class WalletController extends BaseCustomerController
{
    public function index(): Response
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        // Get recent wallet transactions
        $recentTransactions = WalletTransaction::where('customer_id', $this->customer->id)
            ->orderBy('created_at', 'desc')
            ->paginate(5);

        return Inertia::render('customer/Wallet/Index', [
            'balance' => $balance,
            'recentTransactions' => $recentTransactions,
        ]);
    }

    public function topup(): Response
    {
        return Inertia::render('customer/Wallet/Topup');
    }

    public function processTopup(Request $request)
    {

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:10000', 'max:50000000'], // 10k - 50M VND
            'payment_method' => ['required', 'in:vnpay,bank_transfer,momo,zalo_pay'],
            'bank_code' => ['nullable', 'string'], // Mã ngân hàng cho VNPay
        ], [
            'amount.required' => 'Số tiền nạp là bắt buộc.',
            'amount.numeric' => 'Số tiền nạp phải là một số hợp lệ.',
            'amount.min' => 'Số tiền nạp tối thiểu là 10,000 VNĐ.',
            'amount.max' => 'Số tiền nạp tối đa là 50,000,000 VNĐ.',
            'payment_method.required' => 'Phương thức thanh toán là bắt buộc.',
            'payment_method.in' => 'Phương thức thanh toán không hợp lệ. Vui lòng chọn VNPay, Chuyển khoản ngân hàng, MoMo hoặc ZaloPay.',
            'bank_code.string' => 'Mã ngân hàng phải là chuỗi ký tự.',
        ]);

        // Create wallet transaction for topup
        $transaction = WalletTransaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'deposit',
            'amount' => $validated['amount'],
            'fee' => 0, // Nạp tiền không tính phí
            'payment_method' => $validated['payment_method'],
            'status' => 'pending',
            'description' => 'Nạp tiền vào ví qua ' . $validated['payment_method'],
            'vnpay_bank_code' => $validated['bank_code'] ?? null,
        ]);

        // Nếu thanh toán qua VNPay, chuyển hướng đến VNPay
        if ($validated['payment_method'] === 'vnpay') {
            $vnpayService = new VnpayService();
            $paymentUrl = $vnpayService->createPaymentUrl($transaction, $validated['bank_code'] ?? null);
            
            // Check if this is an Inertia request
            if ($request->header('X-Inertia')) {
                // Return JSON with redirect URL for Inertia to handle client-side
                return response()->json([
                    'redirect_url' => $paymentUrl
                ]);
            }
            
            // Traditional redirect for form submission
            return redirect()->away($paymentUrl);
        }

        // Các phương thức thanh toán khác
        return redirect()->route('customer.wallet.topup.status', $transaction)
            ->with('success', 'Yêu cầu nạp tiền đã được tạo thành công!');
    }

    public function topupStatus(WalletTransaction $transaction): Response
    {
        if ($transaction->customer_id !== $this->customer->id) {
            abort(403);
        }

        return Inertia::render('customer/Wallet/TopupStatus', [
            'transaction' => $transaction,
        ]);
    }

    public function withdraw(): Response
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        // Check minimum withdrawal amount
        $minWithdraw = 50000; // 50k VND
        
        // Quick amount options for withdrawal
        $quickAmounts = [50000, 100000, 500000, 1000000];
        
        return Inertia::render('customer/Wallet/Withdraw', [
            'balance' => $balance,
            'minWithdraw' => $minWithdraw,
            'quickAmounts' => $quickAmounts,
        ]);
    }

    public function processWithdraw(Request $request): RedirectResponse
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        if (!$balance) {
            return back()->withErrors(['message' => 'Không tìm thấy thông tin số dư.']);
        }

        $validated = $request->validate([
            'amount' => ['required', 'numeric', 'min:50000', 'max:' . $balance->balance],
            'bank_name' => ['required', 'string', 'max:100'],
            'account_number' => ['required', 'string', 'max:50'],
            'account_holder' => ['required', 'string', 'max:100'],
        ], [
            'amount.required' => 'Số tiền rút là bắt buộc.',
            'amount.numeric' => 'Số tiền rút phải là một số hợp lệ.',
            'amount.min' => 'Số tiền rút tối thiểu là 50,000 VNĐ.',
            'amount.max' => 'Số tiền rút không được vượt quá số dư hiện tại.',
            'bank_name.required' => 'Tên ngân hàng là bắt buộc.',
            'bank_name.string' => 'Tên ngân hàng phải là chuỗi ký tự.',
            'bank_name.max' => 'Tên ngân hàng không được vượt quá 100 ký tự.',
            'account_number.required' => 'Số tài khoản là bắt buộc.',
            'account_number.string' => 'Số tài khoản phải là chuỗi ký tự.',
            'account_number.max' => 'Số tài khoản không được vượt quá 50 ký tự.',
            'account_holder.required' => 'Tên chủ tài khoản là bắt buộc.',
            'account_holder.string' => 'Tên chủ tài khoản phải là chuỗi ký tự.',
            'account_holder.max' => 'Tên chủ tài khoản không được vượt quá 100 ký tự.',
        ]);

        // Calculate withdrawal fee (2%)
        $fee = $validated['amount'] * 0.02;

        // Create wallet transaction for withdrawal
        $transaction = WalletTransaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'withdrawal',
            'amount' => $validated['amount'],
            'fee' => $fee,
            'status' => 'pending',
            'description' => 'Yêu cầu rút tiền',
            'withdrawal_info' => [
                'bank_name' => $validated['bank_name'],
                'account_number' => $validated['account_number'],
                'account_holder' => $validated['account_holder'],
            ],
        ]);

        // Lock the amount from available balance
        $balance->decrement('balance', $validated['amount']);

        return redirect()->route('customer.wallet.index')
            ->with('success', 'Yêu cầu rút tiền đã được gửi thành công! Sẽ được xử lý trong vòng 24 giờ.');
    }

    public function transfer(): Response
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        return Inertia::render('customer/Wallet/Transfer', [
            'balance' => $balance,
        ]);
    }

    public function processTransfer(Request $request): RedirectResponse
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        if (!$balance) {
            return back()->withErrors(['message' => 'Không tìm thấy thông tin số dư.']);
        }

        $validated = $request->validate([
            'recipient_username' => ['required', 'string', 'exists:customers,username'],
            'amount' => ['required', 'numeric', 'min:10000', 'max:' . $balance->balance],
            'note' => ['nullable', 'string', 'max:200'],
        ], [
            'recipient_username.required' => 'Tên người nhận là bắt buộc.',
            'recipient_username.string' => 'Tên người nhận phải là chuỗi ký tự.',
            'recipient_username.exists' => 'Tên người nhận không tồn tại trong hệ thống.',
            'amount.required' => 'Số tiền chuyển là bắt buộc.',
            'amount.numeric' => 'Số tiền chuyển phải là một số hợp lệ.',
            'amount.min' => 'Số tiền chuyển tối thiểu là 10,000 VNĐ.',
            'amount.max' => 'Số tiền chuyển không được vượt quá số dư hiện tại.',
            'note.string' => 'Ghi chú phải là chuỗi ký tự.',
            'note.max' => 'Ghi chú không được vượt quá 200 ký tự.',
        ]);

        // Check if not transferring to self
        if ($validated['recipient_username'] === $this->customer->username) {
            return back()->withErrors(['recipient_username' => 'Không thể chuyển tiền cho chính mình.']);
        }

        // Find recipient
        $recipient = \App\Models\Customer::where('username', $validated['recipient_username'])->first();
        $recipientBalance = CustomerBalance::where('customer_id', $recipient->id)->first();
        
        if (!$recipientBalance) {
            // Create balance for recipient if doesn't exist
            $recipientBalance = CustomerBalance::create([
                'customer_id' => $recipient->id,
                'balance' => 0,
                'locked_balance' => 0,
            ]);
        }

        // Calculate transfer fee (2%)
        $fee = $validated['amount'] * 0.02;
        $netAmount = $validated['amount'] - $fee;

        // Perform transfer
        $balance->decrement('balance', $validated['amount']);
        $recipientBalance->increment('balance', $netAmount);

        // Create wallet transaction records
        WalletTransaction::create([
            'customer_id' => $this->customer->id,
            'type' => 'transfer_out',
            'amount' => $validated['amount'],
            'fee' => $fee,
            'status' => 'completed',
            'description' => 'Chuyển tiền đến ' . $validated['recipient_username'],
            'recipient_id' => $recipient->id,
            'note' => $validated['note'] ?? null,
        ]);

        WalletTransaction::create([
            'customer_id' => $recipient->id,
            'type' => 'transfer_in',
            'amount' => $netAmount,
            'fee' => 0,
            'status' => 'completed',
            'description' => 'Nhận tiền chuyển từ ' . $this->customer->username,
            'sender_id' => $this->customer->id,
            'note' => $validated['note'] ?? null,
        ]);

        return redirect()->route('customer.wallet.index')
            ->with('success', 'Chuyển tiền thành công!');
    }

    public function history(): Response
    {
        $transactions = WalletTransaction::where('customer_id', $this->customer->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('customer/Wallet/History', [
            'transactions' => $transactions,
        ]);
    }

    /**
     * Handle VNPay payment return
     */
    public function vnpayReturn(Request $request): RedirectResponse
    {
        $vnpayService = new VnpayService();
        $result = $vnpayService->processReturn($request->all());
        
        if (!$result['success']) {
            return redirect()->route('customer.wallet.index')
                ->withErrors(['message' => $result['message']]);
        }
        
        $transaction = WalletTransaction::where('vnpay_txn_ref', $result['vnp_TxnRef'])->first();
        
        if (!$transaction) {
            return redirect()->route('customer.wallet.index')
                ->withErrors(['message' => 'Không tìm thấy giao dịch.']);
        }
        
        if ($result['vnp_ResponseCode'] === '00') {
            // Payment successful
            $transaction->update([
                'status' => 'completed',
                'vnpay_response_code' => $result['vnp_ResponseCode'],
                'vnpay_transaction_no' => $result['vnp_TransactionNo'] ?? null,
                'completed_at' => now(),
            ]);
            
            // Add money to customer balance
            $balance = CustomerBalance::where('customer_id', $transaction->customer_id)->first();
            if (!$balance) {
                $balance = CustomerBalance::create([
                    'customer_id' => $transaction->customer_id,
                    'balance' => 0,
                    'locked_balance' => 0,
                ]);
            }
            $balance->increment('balance', $transaction->amount);
            
            return redirect()->route('customer.wallet.topup.status', $transaction)
                ->with('success', 'Nạp tiền thành công!');
        } else {
            // Payment failed
            $transaction->update([
                'status' => 'failed',
                'vnpay_response_code' => $result['vnp_ResponseCode'],
            ]);
            
            return redirect()->route('customer.wallet.topup.status', $transaction)
                ->withErrors(['message' => 'Thanh toán thất bại: ' . $result['message']]);
        }
    }
    
    /**
     * Handle VNPay IPN callback
     */
    public function vnpayCallback(Request $request)
    {
        $vnpayService = new VnpayService();
        $result = $vnpayService->processCallback($request->all());
        
        if (!$result['success']) {
            return response()->json(['RspCode' => '99', 'Message' => $result['message']]);
        }
        
        $transaction = WalletTransaction::where('vnpay_txn_ref', $result['vnp_TxnRef'])->first();
        
        if (!$transaction) {
            return response()->json(['RspCode' => '01', 'Message' => 'Order not found']);
        }
        
        if ($transaction->status === 'completed') {
            return response()->json(['RspCode' => '00', 'Message' => 'Success']);
        }
        
        if ($result['vnp_ResponseCode'] === '00') {
            // Payment successful
            $transaction->update([
                'status' => 'completed',
                'vnpay_response_code' => $result['vnp_ResponseCode'],
                'vnpay_transaction_no' => $result['vnp_TransactionNo'] ?? null,
                'completed_at' => now(),
            ]);
            
            // Add money to customer balance
            $balance = CustomerBalance::where('customer_id', $transaction->customer_id)->first();
            if (!$balance) {
                $balance = CustomerBalance::create([
                    'customer_id' => $transaction->customer_id,
                    'balance' => 0,
                    'locked_balance' => 0,
                ]);
            }
            $balance->increment('balance', $transaction->amount);
            
            return response()->json(['RspCode' => '00', 'Message' => 'Success']);
        } else {
            // Payment failed
            $transaction->update([
                'status' => 'failed',
                'vnpay_response_code' => $result['vnp_ResponseCode'],
            ]);
            
            return response()->json(['RspCode' => '00', 'Message' => 'Success']);
        }
    }
}
