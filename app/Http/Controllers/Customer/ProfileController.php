<?php

namespace App\Http\Controllers\Customer;

use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends BaseCustomerController
{
    public function show(): Response
    {
        return Inertia::render('customer/Profile/Show', [
            'customer' => $this->customer,
        ]);
    }

    public function edit(): Response
    {
        return Inertia::render('customer/Profile/Edit', [
            'customer' => $this->customer,
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:customers,username,' . $this->customer->id],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email,' . $this->customer->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'bio' => ['nullable', 'string', 'max:500'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB
        ], [
            'username.required' => 'Tên đăng nhập là bắt buộc.',
            'username.unique' => 'Tên đăng nhập này đã được sử dụng.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email phải có định dạng hợp lệ.',
            'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác.',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'avatar.image' => 'Ảnh đại diện phải là một tệp hình ảnh.',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB.',
        ]);

        // Handle avatar upload and store path in kyc_data
        $kycData = $this->customer->kyc_data ?? [];
        
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if (isset($kycData['avatar']) && $kycData['avatar']) {
                Storage::disk('public')->delete($kycData['avatar']);
            }
            
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $kycData['avatar'] = $avatarPath;
        }

        // Store additional profile info in kyc_data
        if (isset($validated['full_name'])) {
            $kycData['full_name'] = $validated['full_name'];
            unset($validated['full_name']);
        }
        
        if (isset($validated['bio'])) {
            $kycData['bio'] = $validated['bio'];
            unset($validated['bio']);
        }
        
        unset($validated['avatar']);
        $validated['kyc_data'] = $kycData;

        $this->customer->update($validated);

        return redirect()->route('customer.profile.show')
            ->with('success', 'Hồ sơ đã được cập nhật thành công!');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'current_password' => ['required', 'current_password:customer'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'Mật khẩu hiện tại là bắt buộc.',
            'current_password.current_password' => 'Mật khẩu hiện tại không chính xác.',
            'password.required' => 'Mật khẩu mới là bắt buộc.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
        ]);

        $this->customer->update([
            'password' => Hash::make($validated['password']),
        ]);

        return redirect()->route('customer.profile.show')
            ->with('success', 'Mật khẩu đã được cập nhật thành công!');
    }

    public function deleteAvatar(): RedirectResponse
    {

        if ($this->customer->avatar) {
            Storage::disk('public')->delete($this->customer->avatar);
            $this->customer->update(['avatar' => null]);
        }

        return redirect()->route('customer.profile.edit')
            ->with('success', 'Ảnh đại diện đã được xóa thành công!');
    }

    public function activity(): Response
    {
        // Calculate real statistics for activity overview
        $purchaseCount = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->count() + 
            $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->count();

        $topupCount = $this->customer->walletTransactions()
            ->where('type', 'topup')
            ->where('status', 'completed')
            ->count();

        $paymentCount = $this->customer->walletTransactions()
            ->whereIn('type', ['payment', 'transfer_out'])
            ->where('status', 'completed')
            ->count();

        // Get message count from chat tables
        $messageCount = $this->customer->chats()->count() + 
                       $this->customer->generalChats()->count();

        // Get recent transactions and activities from database
        $recentIntermediateTransactions = $this->customer->buyerTransactions()
            ->latest()
            ->limit(5)
            ->get();

        $recentStoreTransactions = $this->customer->buyerStoreTransactions()
            ->with('product:id,name')
            ->latest()
            ->limit(5)
            ->get();

        $recentWalletTransactions = $this->customer->walletTransactions()
            ->latest()
            ->limit(5)
            ->get();

        $recentPointTransactions = $this->customer->pointTransactions()
            ->latest()
            ->limit(5)
            ->get();

        // Combine all activities and format for frontend
        $activities = collect();

        // Add wallet transactions
        $recentWalletTransactions->each(function ($transaction) use ($activities) {
            $activities->push([
                'id' => 'wallet_' . $transaction->id,
                'type' => 'payment',
                'title' => $this->getWalletActivityTitle($transaction->type),
                'description' => $transaction->description ?? 'Giao dịch ví điện tử',
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at->toISOString(),
            ]);
        });

        // Add point transactions
        $recentPointTransactions->each(function ($transaction) use ($activities) {
            $activities->push([
                'id' => 'point_' . $transaction->id,
                'type' => 'transaction',
                'title' => $this->getPointActivityTitle($transaction->type->value),
                'description' => $transaction->description ?? 'Giao dịch điểm thưởng',
                'amount' => $transaction->amount,
                'status' => 'completed',
                'created_at' => $transaction->created_at->toISOString(),
            ]);
        });

        // Add store transactions
        $recentStoreTransactions->each(function ($transaction) use ($activities) {
            $activities->push([
                'id' => 'store_' . $transaction->id,
                'type' => 'purchase',
                'title' => 'Mua sản phẩm từ cửa hàng',
                'description' => 'Mua sản phẩm "' . ($transaction->product->name ?? 'N/A') . '"',
                'amount' => $transaction->amount,
                'status' => $transaction->status,
                'created_at' => $transaction->created_at->toISOString(),
            ]);
        });

        // Add intermediate transactions
        $recentIntermediateTransactions->each(function ($transaction) use ($activities) {
            $activities->push([
                'id' => 'intermediate_' . $transaction->id,
                'type' => 'transaction',
                'title' => 'Giao dịch trung gian',
                'description' => $transaction->description ?? 'Giao dịch mua bán trung gian',
                'amount' => $transaction->amount,
                'status' => $transaction->status->value,
                'created_at' => $transaction->created_at->toISOString(),
            ]);
        });

        // Sort by created_at and paginate
        $sortedActivities = $activities->sortByDesc('created_at')->values();
        $perPage = 15;
        $page = request()->get('page', 1);
        $total = $sortedActivities->count();
        $paginatedActivities = $sortedActivities->slice(($page - 1) * $perPage, $perPage);

        $activitiesData = [
            'data' => $paginatedActivities->values()->all(),
            'meta' => [
                'current_page' => (int) $page,
                'last_page' => (int) ceil($total / $perPage),
                'per_page' => $perPage,
                'total' => $total,
            ],
        ];

        $activityStats = [
            'purchase_count' => $purchaseCount,
            'topup_count' => $topupCount,
            'payment_count' => $paymentCount,
            'message_count' => $messageCount,
        ];

        return Inertia::render('customer/Profile/Activity', [
            'activities' => $activitiesData,
            'activity_stats' => $activityStats,
        ]);
    }

    private function getWalletActivityTitle(string $type): string
    {
        return match($type) {
            'topup' => 'Nạp tiền vào ví',
            'withdraw' => 'Rút tiền khỏi ví',
            'transfer_out' => 'Chuyển tiền đi',
            'transfer_in' => 'Nhận tiền chuyển',
            'payment' => 'Thanh toán',
            'refund' => 'Hoàn tiền',
            default => 'Giao dịch ví',
        };
    }

    private function getPointActivityTitle(string $type): string
    {
        return match($type) {
            'earned' => 'Kiếm điểm thưởng',
            'spent' => 'Sử dụng điểm thưởng',
            'bonus' => 'Nhận điểm thưởng',
            'penalty' => 'Trừ điểm phạt',
            'referral' => 'Điểm giới thiệu',
            default => 'Giao dịch điểm',
        };
    }

    public function stats(): Response
    {
        // Calculate real statistics from database
        $totalSpentStore = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->sum('amount');
            
        $totalSpentIntermediate = $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->sum('amount');
            
        $totalSpent = $totalSpentStore + $totalSpentIntermediate;

        $totalPurchasesStore = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->count();
            
        $totalPurchasesIntermediate = $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->count();
            
        $totalPurchases = $totalPurchasesStore + $totalPurchasesIntermediate;

        $overviewStats = [
            'total_spent' => $totalSpent,
            'total_purchases' => $totalPurchases,
            'total_points_earned' => $this->customer->points ? $this->customer->points->total_earned : 0,
            'total_points_spent' => $this->customer->points ? $this->customer->points->total_spent : 0,
            'member_since' => $this->customer->created_at,
            'last_purchase' => $this->getLastPurchaseDate(),
        ];

        // Get monthly spending statistics
        $monthlyStats = $this->getMonthlySpendingStats();

        // Get achievements based on real data
        $achievements = $this->calculateAchievements();

        // Calculate rankings
        $rankings = $this->calculateRankings($totalSpent);

        $stats = [
            'overview' => $overviewStats,
            'monthly_stats' => $monthlyStats,
            'achievements' => $achievements,
            'rankings' => $rankings,
        ];

        return Inertia::render('customer/Profile/Stats', [
            'stats' => $stats,
        ]);
    }

    private function getLastPurchaseDate()
    {
        $lastStoreTransaction = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->latest()
            ->first();
            
        $lastIntermediateTransaction = $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->latest()
            ->first();

        $dates = collect([
            $lastStoreTransaction?->created_at,
            $lastIntermediateTransaction?->created_at
        ])->filter()->sort();

        return $dates->last();
    }

    private function getMonthlySpendingStats(): array
    {
        $months = [];
        
        for ($i = 2; $i >= 0; $i--) {
            $month = now()->subMonths($i);
            $monthStart = $month->copy()->startOfMonth();
            $monthEnd = $month->copy()->endOfMonth();
            
            $storeSpent = $this->customer->buyerStoreTransactions()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');
                
            $intermediateSpent = $this->customer->buyerTransactions()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');
                
            $storePurchases = $this->customer->buyerStoreTransactions()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();
                
            $intermediatePurchases = $this->customer->buyerTransactions()
                ->where('status', 'completed')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->count();
                
            $pointsEarned = $this->customer->pointTransactions()
                ->where('type', 'earned')
                ->whereBetween('created_at', [$monthStart, $monthEnd])
                ->sum('amount');

            $months[] = [
                'month' => 'Tháng ' . $month->month,
                'spent' => $storeSpent + $intermediateSpent,
                'purchases' => $storePurchases + $intermediatePurchases,
                'points_earned' => $pointsEarned,
            ];
        }
        
        return $months;
    }

    private function calculateAchievements(): array
    {
        $achievements = [];
        
        $totalPurchases = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->count() + 
            $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->count();
            
        $totalSpent = $this->customer->buyerStoreTransactions()
            ->where('status', 'completed')
            ->sum('amount') + 
            $this->customer->buyerTransactions()
            ->where('status', 'completed')
            ->sum('amount');
            
        $referralCount = $this->customer->referrals()->count();
        
        // First purchase achievement
        if ($totalPurchases > 0) {
            $firstPurchase = $this->getLastPurchaseDate();
            $achievements[] = [
                'id' => 1,
                'title' => 'Khách hàng mới',
                'description' => 'Hoàn thành giao dịch đầu tiên',
                'icon' => 'star',
                'achieved_at' => $firstPurchase ? $firstPurchase->toISOString() : $this->customer->created_at->toISOString(),
                'progress' => 1,
                'max_progress' => 1,
            ];
        }
        
        // Frequent buyer achievement
        if ($totalPurchases >= 10) {
            $achievements[] = [
                'id' => 2,
                'title' => 'Người mua thường xuyên',
                'description' => 'Hoàn thành 10 giao dịch mua',
                'icon' => 'trophy',
                'achieved_at' => now()->toISOString(),
                'progress' => min($totalPurchases, 10),
                'max_progress' => 10,
            ];
        } else {
            $achievements[] = [
                'id' => 2,
                'title' => 'Người mua thường xuyên',
                'description' => 'Hoàn thành 10 giao dịch mua',
                'icon' => 'trophy',
                'achieved_at' => null,
                'progress' => $totalPurchases,
                'max_progress' => 10,
            ];
        }
        
        // Big spender achievement
        if ($totalSpent >= 5000000) {
            $achievements[] = [
                'id' => 3,
                'title' => 'Khách hàng VIP',
                'description' => 'Chi tiêu trên 5 triệu đồng',
                'icon' => 'wallet',
                'achieved_at' => now()->toISOString(),
                'progress' => min($totalSpent, 5000000),
                'max_progress' => 5000000,
            ];
        } else {
            $achievements[] = [
                'id' => 3,
                'title' => 'Khách hàng VIP',
                'description' => 'Chi tiêu trên 5 triệu đồng',
                'icon' => 'wallet',
                'achieved_at' => null,
                'progress' => $totalSpent,
                'max_progress' => 5000000,
            ];
        }
        
        // Referral achievement
        if ($referralCount >= 5) {
            $achievements[] = [
                'id' => 4,
                'title' => 'Người giới thiệu',
                'description' => 'Giới thiệu 5 người bạn tham gia',
                'icon' => 'users',
                'achieved_at' => now()->toISOString(),
                'progress' => min($referralCount, 5),
                'max_progress' => 5,
            ];
        } else {
            $achievements[] = [
                'id' => 4,
                'title' => 'Người giới thiệu',
                'description' => 'Giới thiệu 5 người bạn tham gia',
                'icon' => 'users',
                'achieved_at' => null,
                'progress' => $referralCount,
                'max_progress' => 5,
            ];
        }
        
        return $achievements;
    }

    private function calculateRankings(float $totalSpent): array
    {
        // Calculate spending rank
        $customersWithHigherSpending = Customer::whereHas('buyerStoreTransactions', function($query) use ($totalSpent) {
            $query->where('status', 'completed')
                  ->havingRaw('SUM(amount) > ?', [$totalSpent]);
        })
        ->orWhereHas('buyerTransactions', function($query) use ($totalSpent) {
            $query->where('status', 'completed')
                  ->havingRaw('SUM(amount) > ?', [$totalSpent]);
        })
        ->count();
        
        $spendingRank = $customersWithHigherSpending + 1;
        
        // Calculate points rank
        $currentPoints = $this->customer->points ? $this->customer->points->available_points : 0;
        $customersWithHigherPoints = Customer::whereHas('points', function($query) use ($currentPoints) {
            $query->where('available_points', '>', $currentPoints);
        })->count();
        
        $pointsRank = $customersWithHigherPoints + 1;
        
        $totalCustomers = Customer::count();

        return [
            'spending_rank' => $spendingRank,
            'points_rank' => $pointsRank,
            'total_customers' => $totalCustomers,
        ];
    }

    public function security(): Response
    {
        // Get real security activities from various sources
        $securityActivities = collect();

        // Get recent login activities (if you have a login_logs table, otherwise use created_at)
        // For now, we'll simulate with customer creation and recent activities
        
        // Add account creation as first security activity
        $securityActivities->push([
            'id' => 'account_created',
            'activity' => 'Tạo tài khoản',
            'ip_address' => request()->ip() ?? '127.0.0.1',
            'user_agent' => request()->userAgent() ?? 'Unknown',
            'created_at' => $this->customer->created_at->toISOString(),
            'is_suspicious' => false,
        ]);

        // Add password change activity if password_changed_at exists
        if ($this->customer->password_changed_at) {
            $securityActivities->push([
                'id' => 'password_changed',
                'activity' => 'Đổi mật khẩu',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'created_at' => $this->customer->password_changed_at->toISOString(),
                'is_suspicious' => false,
            ]);
        }

        // Add email verification activity
        if ($this->customer->email_verified_at) {
            $securityActivities->push([
                'id' => 'email_verified',
                'activity' => 'Xác thực email',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'created_at' => \Carbon\Carbon::parse($this->customer->email_verified_at)->toISOString(),
                'is_suspicious' => false,
            ]);
        }

        // Add KYC verification activity
        if ($this->customer->kyc_verified_at) {
            $securityActivities->push([
                'id' => 'kyc_verified',
                'activity' => 'Xác thực KYC',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'created_at' => \Carbon\Carbon::parse($this->customer->kyc_verified_at)->toISOString(),
                'is_suspicious' => false,
            ]);
        }

        // Add recent high-value transactions as security activities
        $highValueTransactions = $this->customer->buyerStoreTransactions()
            ->where('amount', '>', 1000000) // Transactions over 1M VND
            ->latest()
            ->limit(3)
            ->get();

        $highValueTransactions->each(function ($transaction) use ($securityActivities) {
            $securityActivities->push([
                'id' => 'high_value_transaction_' . $transaction->id,
                'activity' => 'Giao dịch giá trị cao',
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'created_at' => $transaction->created_at->toISOString(),
                'is_suspicious' => $transaction->amount > 5000000, // Flag transactions over 5M as potentially suspicious
            ]);
        });

        // Add recent wallet activities
        $recentWalletActivities = $this->customer->walletTransactions()
            ->whereIn('type', ['topup', 'withdraw'])
            ->latest()
            ->limit(3)
            ->get();

        $recentWalletActivities->each(function ($transaction) use ($securityActivities) {
            $activityName = $transaction->type === 'topup' ? 'Nạp tiền vào ví' : 'Rút tiền từ ví';
            $securityActivities->push([
                'id' => 'wallet_' . $transaction->id,
                'activity' => $activityName,
                'ip_address' => request()->ip() ?? '127.0.0.1',
                'user_agent' => request()->userAgent() ?? 'Unknown',
                'created_at' => $transaction->created_at->toISOString(),
                'is_suspicious' => $transaction->type === 'withdraw' && $transaction->amount > 2000000, // Large withdrawals might be suspicious
            ]);
        });

        // Sort by date and take latest 10
        $sortedActivities = $securityActivities
            ->sortByDesc('created_at')
            ->take(10)
            ->values()
            ->all();

        return Inertia::render('customer/Profile/Security', [
            'security_activities' => $sortedActivities,
            'two_factor_enabled' => false, // TODO: Implement 2FA feature
        ]);
    }

    public function preferences(): Response
    {
        // Get preferences from customer's preferences column or use defaults
        $defaultPreferences = [
            'notifications' => [
                'email_notifications' => true,
                'sms_notifications' => false,
                'push_notifications' => true,
                'marketing_emails' => false,
                'order_updates' => true,
                'security_alerts' => true,
                'weekly_reports' => false,
            ],
            'appearance' => [
                'theme' => 'light',
                'language' => 'vi',
                'timezone' => 'Asia/Ho_Chi_Minh',
                'currency' => 'VND',
            ],
            'privacy' => [
                'profile_visibility' => 'public',
                'activity_visibility' => true,
                'data_sharing' => false,
                'analytics_tracking' => true,
            ],
            'communication' => [
                'chat_notifications' => true,
                'email_frequency' => 'daily',
                'notification_sound' => true,
            ],
        ];

        // If customer has preferences saved, merge with defaults
        $customerPreferences = $this->customer->preferences ?? [];
        $preferences = array_replace_recursive($defaultPreferences, $customerPreferences);

        return Inertia::render('customer/Profile/Preferences', [
            'preferences' => $preferences,
        ]);
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'notifications.email_notifications' => ['boolean'],
            'notifications.sms_notifications' => ['boolean'],
            'notifications.push_notifications' => ['boolean'],
            'notifications.marketing_emails' => ['boolean'],
            'notifications.order_updates' => ['boolean'],
            'notifications.security_alerts' => ['boolean'],
            'notifications.weekly_reports' => ['boolean'],
            'appearance.theme' => ['in:light,dark,auto'],
            'appearance.language' => ['in:en,vi'],
            'appearance.timezone' => ['string'],
            'appearance.currency' => ['in:VND,USD,EUR'],
            'privacy.profile_visibility' => ['in:public,private,friends'],
            'privacy.activity_visibility' => ['boolean'],
            'privacy.data_sharing' => ['boolean'],
            'privacy.analytics_tracking' => ['boolean'],
            'communication.chat_notifications' => ['boolean'],
            'communication.email_frequency' => ['in:immediate,daily,weekly,never'],
            'communication.notification_sound' => ['boolean'],
        ]);

        // Save preferences to customer's preferences column
        $this->customer->update([
            'preferences' => $validated
        ]);
        
        return redirect()->route('customer.profile.preferences')
            ->with('success', 'Tùy chọn đã được cập nhật thành công!');
    }
}
