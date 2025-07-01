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
            'referral_code' => $referralCode,
            'referral_url' => url("/register?ref={$referralCode}"),
            'referral_stats' => [
                'total_referrals' => $totalReferrals,
                'active_referrals' => $activeReferrals,
                'total_earnings' => $totalEarnings,
                'pending_earnings' => 0, // You may want to calculate this
            ],
            'referred_customers' => $referrals,
            'referral_earnings' => PointTransaction::where('customer_id', $this->customer->id)
                ->where('type', 'referral_bonus')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get(),
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
                'Tham gia marketplace tuyệt vời này bằng mã giới thiệu của tôi: ' . $referralCode,
                'Bắt đầu bán và mua sản phẩm số! Sử dụng mã: ' . $referralCode,
                'Bắt đầu với các ưu đãi độc quyền: ' . $referralLink,
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
                    '1. Chia sẻ mã giới thiệu độc quyền của bạn với bạn bè',
                    '2. Họ đăng ký bằng mã của bạn',
                    '3. Bạn kiếm được 50 điểm khi họ hoàn thành đăng ký',
                    '4. Kiếm thêm 100 điểm thưởng khi họ mua hàng lần đầu',
                    '5. Nhận 5% hoa hồng từ tất cả giao dịch tương lai của họ',
                ],
                'earning_structure' => [
                    'Thưởng Đăng Ký' => '50 điểm cho mỗi giới thiệu thành công',
                    'Thưởng Mua Hàng Đầu Tiên' => '100 điểm khi người được giới thiệu mua hàng lần đầu',
                    'Hoa Hồng Liên Tục' => '5% phí giao dịch của người được giới thiệu',
                    'Thưởng Hàng Tháng' => 'Thêm 200 điểm cho 10+ giới thiệu hoạt động',
                ],
                'requirements' => [
                    'Người được giới thiệu phải là người mới trên nền tảng',
                    'Người được giới thiệu phải hoàn thành xác minh tài khoản',
                    'Hoa hồng được trả hàng tháng',
                    'Tài khoản phải duy trì uy tín tốt',
                ],
                'limits' => [
                    'Tối đa 100 giới thiệu mỗi tháng',
                    'Giới hạn hoa hồng: 10,000 điểm mỗi tháng',
                    'Mã giới thiệu phải được sử dụng trong vòng 30 ngày',
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
