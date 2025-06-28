<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\Customer;
use App\Models\CustomerPoint;
use App\Models\PointTransaction;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ReferralController extends BaseCustomerController
{
    public function index(): Response
    {
        
        // Get customer's referral code
        $referralCode = $this->getOrCreateReferralCode($this->customer);

        // Get referrals made by this customer
        $referrals = Referral::where('referrer_id', $this->customer->id)
            ->with(['referred:id,username,created_at'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Calculate stats
        $totalReferrals = $referrals->total();
        $activeReferrals = Referral::where('referrer_id', $this->customer->id)
            ->where('status', 'active')
            ->count();

        $totalEarnings = PointTransaction::where('customer_id', $this->customer->id)
            ->where('type', 'referral_bonus')
            ->sum('amount');

        return Inertia::render('customer/Referrals/Index', [
            'referralCode' => $referralCode,
            'referrals' => $referrals,
            'stats' => [
                'total_referrals' => $totalReferrals,
                'active_referrals' => $activeReferrals,
                'total_earnings' => $totalEarnings,
            ],
            'bonusStructure' => [
                'signup_bonus' => 50, // Points for successful referral
                'purchase_bonus' => 100, // Points when referred user makes first purchase
                'commission_rate' => 5, // 5% commission on referred user's transactions
            ],
        ]);
    }

    public function share(): Response
    {

        $referralCode = $this->getOrCreateReferralCode($this->customer);
        $referralLink = url("/register?ref={$referralCode}");
        
        return Inertia::render('customer/Referrals/Share', [
            'referralCode' => $referralCode,
            'referralLink' => $referralLink,
            'shareMessages' => [
                'Join this amazing marketplace using my referral code: ' . $referralCode,
                'Start selling and buying digital products! Use code: ' . $referralCode,
                'Get started with exclusive bonuses: ' . $referralLink,
            ],
        ]);
    }

    public function regenerateCode(): RedirectResponse
    {
        
        // Generate new unique referral code
        do {
            $newCode = strtoupper(Str::random(8));
        } while (Customer::where('referral_code', $newCode)->exists());
        
        $this->customer->update(['referral_code' => $newCode]);
        
        return redirect()->route('customer.referrals.index')
            ->with('success', 'Mã giới thiệu đã được tạo lại thành công!');
    }

    public function earnings(): Response
    {
        
        // Get earnings from referrals
        $earnings = PointTransaction::where('customer_id', $this->customer->id)
            ->where('type', 'referral_bonus')
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        // Monthly earnings summary
        $monthlyEarnings = PointTransaction::where('customer_id', $this->customer->id)
            ->where('type', 'referral_bonus')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw('DATE_FORMAT(created_at, "%Y-%m") as month, SUM(amount) as total')
            ->groupBy('month')
            ->orderBy('month', 'desc')
            ->get();

        return Inertia::render('customer/Referrals/Earnings', [
            'earnings' => $earnings,
            'monthlyEarnings' => $monthlyEarnings,
        ]);
    }

    public function program(): Response
    {
        return Inertia::render('customer/Referrals/Program', [
            'programDetails' => [
                'how_it_works' => [
                    '1. Share your unique referral code with friends',
                    '2. They sign up using your code',
                    '3. You earn 50 points when they complete registration',
                    '4. Earn 100 bonus points when they make their first purchase',
                    '5. Get 5% commission on all their future transactions',
                ],
                'earning_structure' => [
                    'Registration Bonus' => '50 points per successful referral',
                    'First Purchase Bonus' => '100 points when referred user makes first purchase',
                    'Ongoing Commission' => '5% of referred user\'s transaction fees',
                    'Monthly Bonus' => 'Extra 200 points for 10+ active referrals',
                ],
                'requirements' => [
                    'Referred user must be new to the platform',
                    'Referred user must complete account verification',
                    'Commission is paid monthly',
                    'Account must remain in good standing',
                ],
                'limits' => [
                    'Maximum 100 referrals per month',
                    'Commission cap: 10,000 points per month',
                    'Referral code must be used within 30 days',
                ],
            ],
        ]);
    }

    public function leaderboard(): Response
    {
        // Get top referrers (this would typically be cached)
        $topReferrers = Customer::withCount('referrals')
            ->having('referrals_count', '>', 0)
            ->orderBy('referrals_count', 'desc')
            ->limit(50)
            ->get(['id', 'username', 'created_at'])
            ->map(function ($customer) {
                // Calculate total points earned from referrals
                $totalEarnings = PointTransaction::where('customer_id', $customer->id)
                    ->where('type', 'referral_bonus')
                    ->sum('amount');
                
                $customer->total_earnings = $totalEarnings;
                return $customer;
            });

        $currentCustomer = $this->customer;

        // Find current customer's rank
        $currentCustomerRank = null;
        $currentCustomerEarnings = PointTransaction::where('customer_id', $currentCustomer->id)
            ->where('type', 'referral_bonus')
            ->sum('amount');

        foreach ($topReferrers as $index => $referrer) {
            if ($referrer->id === $currentCustomer->id) {
                $currentCustomerRank = $index + 1;
                break;
            }
        }

        return Inertia::render('customer/Referrals/Leaderboard', [
            'topReferrers' => $topReferrers,
            'currentRank' => $currentCustomerRank,
            'currentEarnings' => $currentCustomerEarnings,
        ]);
    }

    public function track(Request $request): Response
    {
        
        $validated = $request->validate([
            'period' => ['nullable', 'in:week,month,quarter,year'],
        ]);

        $period = $validated['period'] ?? 'month';
        
        // Calculate date range
        $dateRange = match($period) {
            'week' => [now()->startOfWeek(), now()->endOfWeek()],
            'month' => [now()->startOfMonth(), now()->endOfMonth()],
            'quarter' => [now()->startOfQuarter(), now()->endOfQuarter()],
            'year' => [now()->startOfYear(), now()->endOfYear()],
        };

        // Get referral stats for the period
        $referralsInPeriod = Referral::where('referrer_id', $this->customer->id)
            ->whereBetween('created_at', $dateRange)
            ->with('referred:id,username,created_at')
            ->get();

        $earningsInPeriod = PointTransaction::where('customer_id', $this->customer->id)
            ->where('type', 'referral_bonus')
            ->whereBetween('created_at', $dateRange)
            ->sum('amount');

        // Daily breakdown for charts
        $dailyStats = [];
        $current = $dateRange[0]->copy();
        while ($current <= $dateRange[1]) {
            $dayReferrals = $referralsInPeriod->filter(fn($r) => $r->created_at->isSameDay($current))->count();
            $dayEarnings = PointTransaction::where('customer_id', $this->customer->id)
                ->where('type', 'referral_bonus')
                ->whereDate('created_at', $current)
                ->sum('amount');
            
            $dailyStats[] = [
                'date' => $current->format('Y-m-d'),
                'referrals' => $dayReferrals,
                'earnings' => $dayEarnings,
            ];
            
            $current->addDay();
        }

        return Inertia::render('customer/Referrals/Track', [
            'period' => $period,
            'referralsInPeriod' => $referralsInPeriod,
            'earningsInPeriod' => $earningsInPeriod,
            'dailyStats' => $dailyStats,
        ]);
    }

    private function getOrCreateReferralCode(Customer $customer): string
    {
        if (!$customer->referral_code) {
            // Generate unique referral code
            do {
                $code = strtoupper(Str::random(8));
            } while (Customer::where('referral_code', $code)->exists());
            
            $customer->update(['referral_code' => $code]);
            return $code;
        }
        
        return $customer->referral_code;
    }
}
