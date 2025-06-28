<?php

namespace App\Http\Controllers\Customer;

use App\Models\Customer;
use App\Models\IntermediateTransaction;
use App\Models\StoreTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends BaseCustomerController
{
    /**
     * Show the customer dashboard.
     */
    public function index(Request $request): Response
    {
        // Calculate statistics
        $stats = [
            'total_transactions' => IntermediateTransaction::where('buyer_id', $this->customer->id)
                ->orWhere('seller_id', $this->customer->id)->count(),
            'completed_transactions' => IntermediateTransaction::where('buyer_id', $this->customer->id)
                ->orWhere('seller_id', $this->customer->id)
                ->where('status', 'COMPLETED')->count(),
            'total_spent' => IntermediateTransaction::where('buyer_id', $this->customer->id)
                ->where('status', 'COMPLETED')
                ->sum('amount'),
            'total_earned' => IntermediateTransaction::where('seller_id', $this->customer->id)
                ->where('status', 'COMPLETED')
                ->sum('amount'),
            'current_balance' => $this->getAvailableBalance(),
            'current_points' => $this->getPoints(),
            'referrals_count' => Customer::where('referred_by', $this->customer->id)->count(),
            'store_sales' => StoreTransaction::where('seller_id', $this->customer->id)
                ->where('status', 'COMPLETED')
                ->sum('amount'),
        ];

        // Recent transactions
        $recentTransactions = IntermediateTransaction::where('buyer_id', $this->customer->id)
            ->orWhere('seller_id', $this->customer->id)
            ->with(['buyer', 'seller'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Recent store transactions
        $recentStoreTransactions = StoreTransaction::where('buyer_id', $this->customer->id)
            ->orWhere('seller_id', $this->customer->id)
            ->with(['buyer', 'seller', 'product'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        // Mock notifications - replace with real notifications
        $notifications = [
            [
                'id' => '1',
                'type' => 'transaction',
                'title' => 'Giao dịch mới',
                'message' => 'Bạn có một giao dịch đang chờ xác nhận',
                'data' => [],
                'read_at' => null,
                'created_at' => now()->subMinutes(10)->toISOString(),
            ],
            [
                'id' => '2',
                'type' => 'point',
                'title' => 'Điểm thưởng',
                'message' => 'Bạn vừa nhận được 5 điểm C từ giao dịch',
                'data' => [],
                'read_at' => null,
                'created_at' => now()->subHours(2)->toISOString(),
            ],
        ];

        return Inertia::render('customer/Dashboard', [
            'customer' => $this->customer,
            'stats' => $stats,
            'recentTransactions' => $recentTransactions,
            'recentStoreTransactions' => $recentStoreTransactions,
            'notifications' => $notifications,
        ]);
    }
}
