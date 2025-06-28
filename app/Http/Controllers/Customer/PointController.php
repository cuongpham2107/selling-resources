<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\CustomerPoint;
use App\Models\PointTransaction;
use App\Models\CustomerBalance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class PointController extends BaseCustomerController
{
    public function index(): Response
    {
        
        $points = CustomerPoint::where('customer_id', $this->customer->id)->first();
        
        // Get recent point transactions
        $recentTransactions = PointTransaction::where('customer_id', $this->customer->id)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return Inertia::render('customer/Points/Index', [
            'points' => $points,
            'recentTransactions' => $recentTransactions,
            'exchangeRate' => 1000, // 1000 VND = 1 point
        ]);
    }

    public function exchange(): Response
    {
        
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        $points = CustomerPoint::where('customer_id', $this->customer->id)->first();
        
        return Inertia::render('customer/Points/Exchange', [
            'balance' => $balance,
            'points' => $points,
            'exchangeRate' => 1000, // 1000 VND = 1 point
        ]);
    }

    public function processExchange(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'type' => ['required', 'in:balance_to_points,points_to_balance'],
            'amount' => ['required', 'numeric', 'min:1'],
        ], [
            'type.required' => 'Loại đổi điểm là bắt buộc.',
            'type.in' => 'Loại đổi điểm không hợp lệ. Chỉ được đổi từ số dư sang điểm hoặc từ điểm sang số dư.',
            'amount.required' => 'Số lượng cần đổi là bắt buộc.',
            'amount.numeric' => 'Số lượng cần đổi phải là một số hợp lệ.',
            'amount.min' => 'Số lượng cần đổi phải lớn hơn 0.',
        ]);

        $exchangeRate = 1000; // 1000 VND = 1 point

        if ($validated['type'] === 'balance_to_points') {
            return $this->exchangeBalanceToPoints($this->customer, $validated['amount'], $exchangeRate);
        } else {
            return $this->exchangePointsToBalance($this->customer, $validated['amount'], $exchangeRate);
        }
    }

    private function exchangeBalanceToPoints($customer, $vndAmount, $exchangeRate): RedirectResponse
    {
        $balance = CustomerBalance::where('customer_id', $this->customer->id)->first();
        
        if (!$balance || $balance->available_balance < $vndAmount) {
            return back()->withErrors(['amount' => 'Số dư không đủ.']);
        }

        $pointsAmount = $vndAmount / $exchangeRate;

        // Get or create customer points record
        $points = CustomerPoint::firstOrCreate(
            ['customer_id' => $this->customer->id],
            ['available_points' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );

        // Perform exchange
        $balance->decrement('available_balance', $vndAmount);
        $points->increment('available_points', $pointsAmount);
        $points->increment('total_earned', $pointsAmount);

        // Record transaction
        PointTransaction::create([
            'customer_id' => $this->customer->id,
            'amount' => $pointsAmount,
            'type' => 'exchange_in',
            'description' => "Exchanged {$vndAmount} VND to {$pointsAmount} points",
        ]);

        return redirect()->route('customer.points.index')
            ->with('success', "Đã đổi thành công {$vndAmount} VND thành {$pointsAmount} điểm!");
    }

    private function exchangePointsToBalance($customer, $pointsAmount, $exchangeRate): RedirectResponse
    {
        $points = CustomerPoint::where('customer_id', $this->customer->id)->first();
        
        if (!$points || $points->available_points < $pointsAmount) {
            return back()->withErrors(['amount' => 'Điểm không đủ.']);
        }

        $vndAmount = $pointsAmount * $exchangeRate;

        // Get or create customer balance record
        $balance = CustomerBalance::firstOrCreate(
            ['customer_id' => $this->customer->id],
            ['available_balance' => 0, 'pending_balance' => 0]
        );

        // Perform exchange
        $points->decrement('available_points', $pointsAmount);
        $points->increment('total_spent', $pointsAmount);
        $balance->increment('available_balance', $vndAmount);

        // Record transaction
        PointTransaction::create([
            'customer_id' => $this->customer->id,
            'amount' => -$pointsAmount,
            'type' => 'exchange_out',
            'description' => "Exchanged {$pointsAmount} points to {$vndAmount} VND",
        ]);

        return redirect()->route('customer.points.index')
            ->with('success', "Đã đổi thành công {$pointsAmount} điểm thành {$vndAmount} VND!");
    }

    public function spend(): Response
    {
        
        $points = CustomerPoint::where('customer_id', $this->customer->id)->first();
        
        // Get available spending options (discounts, etc.)
        $spendingOptions = [
            [
                'id' => 'transaction_fee_discount',
                'name' => 'Transaction Fee Discount',
                'description' => 'Reduce transaction fees by 50% for next 10 transactions',
                'cost' => 100,
                'type' => 'discount'
            ],
            [
                'id' => 'priority_support',
                'name' => 'Priority Support',
                'description' => 'Get priority customer support for 30 days',
                'cost' => 200,
                'type' => 'service'
            ],
            [
                'id' => 'featured_listing',
                'name' => 'Featured Product Listing',
                'description' => 'Feature your product for 7 days',
                'cost' => 150,
                'type' => 'promotion'
            ],
        ];

        return Inertia::render('customer/Points/Spend', [
            'points' => $points,
            'spendingOptions' => $spendingOptions,
        ]);
    }

    public function processSpend(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'option_id' => ['required', 'string'],
            'cost' => ['required', 'numeric', 'min:1'],
        ], [
            'option_id.required' => 'Tùy chọn tiêu điểm là bắt buộc.',
            'option_id.string' => 'Tùy chọn tiêu điểm phải là chuỗi ký tự.',
            'cost.required' => 'Số điểm cần tiêu là bắt buộc.',
            'cost.numeric' => 'Số điểm cần tiêu phải là một số hợp lệ.',
            'cost.min' => 'Số điểm cần tiêu phải lớn hơn 0.',
        ]);

        $points = CustomerPoint::where('customer_id', $this->customer->id)->first();
        
        if (!$points || $points->available_points < $validated['cost']) {
            return back()->withErrors(['message' => 'Điểm không đủ.']);
        }

        // Deduct points
        $points->decrement('available_points', $validated['cost']);
        $points->increment('total_spent', $validated['cost']);

        // Record transaction
        PointTransaction::create([
            'customer_id' => $this->customer->id,
            'amount' => -$validated['cost'],
            'type' => 'spent',
            'description' => "Spent on: {$validated['option_id']}",
        ]);

        // Here you would implement the actual benefit logic
        // For example, set flags in customer record for discounts, etc.

        return redirect()->route('customer.points.index')
            ->with('success', 'Sử dụng điểm thành công! Quyền lợi đã được áp dụng cho tài khoản của bạn.');
    }

    public function history(): Response
    {
        
        $transactions = PointTransaction::where('customer_id', $this->customer->id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return Inertia::render('customer/Points/History', [
            'transactions' => $transactions,
        ]);
    }

    public function earn(): Response
    {
        
        // Get ways to earn points
        $earningMethods = [
            [
                'id' => 'daily_login',
                'name' => 'Daily Login',
                'description' => 'Login daily to earn points',
                'points' => 5,
                'available' => true, // Check if user already claimed today
            ],
            [
                'id' => 'complete_profile',
                'name' => 'Complete Profile',
                'description' => 'Complete your profile information',
                'points' => 50,
                'available' => false, // Check if already completed
            ],
            [
                'id' => 'refer_friend',
                'name' => 'Refer a Friend',
                'description' => 'Earn points when friends join and make first purchase',
                'points' => 100,
                'available' => true,
            ],
        ];

        return Inertia::render('customer/Points/Earn', [
            'earningMethods' => $earningMethods,
        ]);
    }

    public function claimEarning(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'method_id' => ['required', 'string'],
            'points' => ['required', 'numeric', 'min:1'],
        ], [
            'method_id.required' => 'Phương thức kiếm điểm là bắt buộc.',
            'method_id.string' => 'Phương thức kiếm điểm phải là chuỗi ký tự.',
            'points.required' => 'Số điểm kiếm được là bắt buộc.',
            'points.numeric' => 'Số điểm kiếm được phải là một số hợp lệ.',
            'points.min' => 'Số điểm kiếm được phải lớn hơn 0.',
        ]);

        // Here you would implement logic to verify if the earning method is valid
        // and if the customer is eligible to claim it

        // Get or create customer points record
        $points = CustomerPoint::firstOrCreate(
            ['customer_id' => $this->customer->id],
            ['available_points' => 0, 'total_earned' => 0, 'total_spent' => 0]
        );

        // Award points
        $points->increment('available_points', $validated['points']);
        $points->increment('total_earned', $validated['points']);

        // Record transaction
        PointTransaction::create([
            'customer_id' => $this->customer->id,
            'amount' => $validated['points'],
            'type' => 'earned',
            'description' => "Earned from: {$validated['method_id']}",
        ]);

        return redirect()->route('customer.points.earn')
            ->with('success', "Chúc mừng! Bạn đã kiếm được {$validated['points']} điểm!");
    }
}
