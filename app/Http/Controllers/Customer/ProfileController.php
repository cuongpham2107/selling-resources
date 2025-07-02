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
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:customers,email,' . $this->customer->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'bio' => ['nullable', 'string', 'max:500'],
            'avatar' => ['nullable', 'image', 'max:2048'], // 2MB
        ], [
            'full_name.required' => 'Họ và tên là bắt buộc.',
            'full_name.string' => 'Họ và tên phải là chuỗi ký tự.',
            'full_name.max' => 'Họ và tên không được vượt quá 255 ký tự.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email phải có định dạng hợp lệ.',
            'email.max' => 'Email không được vượt quá 255 ký tự.',
            'email.unique' => 'Email này đã được sử dụng bởi tài khoản khác.',
            'phone.string' => 'Số điện thoại phải là chuỗi ký tự.',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'bio.string' => 'Tiểu sử phải là chuỗi ký tự.',
            'bio.max' => 'Tiểu sử không được vượt quá 500 ký tự.',
            'avatar.image' => 'Ảnh đại diện phải là một tệp hình ảnh (jpg, jpeg, png, bmp, gif, svg, webp).',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB.',
        ]);

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($this->customer->avatar) {
                Storage::disk('public')->delete($this->customer->avatar);
            }
            
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $validated['avatar'] = $avatarPath;
        }

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
        
        // Get recent activity (this would be more comprehensive in a real app)
        $recentTransactions = $this->customer->buyerTransactions()
            ->with('product:id,name')
            ->latest()
            ->limit(10)
            ->get();

        $recentSales = $this->customer->sellerTransactions()
            // ->with('product:id,name')
            ->latest()
            ->limit(10)
            ->get();

        // Sample activity data - in a real app, this would come from an activities table
        $activities = [
            'data' => [
                [
                    'id' => 1,
                    'type' => 'purchase',
                    'title' => 'Mua sản phẩm thành công',
                    'description' => 'Bạn đã mua sản phẩm "Laravel Course" với giá 500,000₫',
                    'amount' => 500000,
                    'status' => 'completed',
                    'created_at' => now()->subHours(2)->toISOString(),
                ],
                [
                    'id' => 2,
                    'type' => 'transaction',
                    'title' => 'Nạp tiền vào ví',
                    'description' => 'Nạp tiền thành công vào ví điện tử',
                    'amount' => 1000000,
                    'status' => 'completed',
                    'created_at' => now()->subDays(1)->toISOString(),
                ],
            ],
            'meta' => [
                'current_page' => 1,
                'last_page' => 1,
                'per_page' => 15,
                'total' => 2,
            ],
        ];

        // Sample activity stats
        $activityStats = [
            'purchase_count' => $this->customer->buyerTransactions()->where('status', 'completed')->count(),
            'topup_count' => $this->customer->topups()->where('status', 'completed')->count(),
            'payment_count' => $this->customer->buyerTransactions()->count() + ($this->customer->topups()->count() ?? 0),
            'message_count' => 0, // This would come from a messages table in a real app
        ];

        return Inertia::render('customer/Profile/Activity', [
            'customer' => $this->customer,
            'activities' => $activities,
            'activity_stats' => $activityStats,
        ]);
    }

    public function stats(): Response
    {
        
        // Calculate various statistics
        $overviewStats = [
            'total_spent' => $this->customer->buyerTransactions()->where('status', 'completed')->sum('amount'),
            'total_purchases' => $this->customer->buyerTransactions()->where('status', 'completed')->count(),
            'total_points_earned' => $this->customer->points ? $this->customer->points->total_earned : 0,
            'total_points_spent' => $this->customer->points ? $this->customer->points->total_spent : 0,
            'member_since' => $this->customer->created_at,
            'last_purchase' => $this->customer->buyerTransactions()->latest()->first()?->created_at ?? null,
        ];

        // Sample monthly stats
        $monthlyStats = [
            ['month' => 'Tháng 1', 'spent' => 2500000, 'purchases' => 5, 'points_earned' => 250],
            ['month' => 'Tháng 2', 'spent' => 1800000, 'purchases' => 3, 'points_earned' => 180],
            ['month' => 'Tháng 3', 'spent' => 3200000, 'purchases' => 7, 'points_earned' => 320],
        ];

        // Sample achievements
        $achievements = [
            [
                'id' => 1,
                'title' => 'Khách hàng mới',
                'description' => 'Hoàn thành giao dịch đầu tiên',
                'icon' => 'star',
                'achieved_at' => $this->customer->created_at,
                'progress' => 1,
                'max_progress' => 1,
            ],
            [
                'id' => 2,
                'title' => 'Người mua thường xuyên',
                'description' => 'Hoàn thành 10 giao dịch mua',
                'icon' => 'trophy',
                'achieved_at' => now()->subDays(30)->toISOString(),
                'progress' => 10,
                'max_progress' => 10,
            ],
        ];

        // Sample rankings
        $rankings = [
            'spending_rank' => 45,
            'points_rank' => 38,
            'total_customers' => 1250,
        ];

        $stats = [
            'overview' => $overviewStats,
            'monthly_stats' => $monthlyStats,
            'achievements' => $achievements,
            'rankings' => $rankings,
        ];

        return Inertia::render('customer/Profile/Stats', [
            'customer' => $this->customer,
            'stats' => $stats,
        ]);
    }

    public function security(): Response
    {
        
        // Sample security activities - in a real app, this would come from a security_logs table
        $securityActivities = [
            [
                'id' => 1,
                'activity' => 'Đăng nhập thành công',
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => now()->subHours(2)->toISOString(),
                'is_suspicious' => false,
            ],
            [
                'id' => 2,
                'activity' => 'Đổi mật khẩu',
                'ip_address' => '192.168.1.1',
                'user_agent' => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'created_at' => now()->subDays(3)->toISOString(),
                'is_suspicious' => false,
            ],
        ];

        return Inertia::render('customer/Profile/Security', [
            'customer' => $this->customer,
            'security_activities' => $securityActivities,
            'two_factor_enabled' => $this->customer->hasEnabledTwoFactorAuthentication(),
        ]);
    }

    public function preferences(): Response
    {
        
        return Inertia::render('customer/Profile/Preferences', [
            'preferences' => [
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
            ],
        ]);
    }

    public function updatePreferences(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'notifications.email_notifications' => ['boolean'],
            'notifications.transaction_updates' => ['boolean'],
            'notifications.marketing_emails' => ['boolean'],
            'notifications.dispute_notifications' => ['boolean'],
            'privacy.show_online_status' => ['boolean'],
            'privacy.allow_direct_messages' => ['boolean'],
            'privacy.show_transaction_history' => ['boolean'],
            'display.theme' => ['in:light,dark'],
            'display.language' => ['in:en,vi'],
            'display.timezone' => ['string'],
        ]);

        // In a real app, you would store these preferences in a separate table
        // For now, we'll just return success
        
        return redirect()->route('customer.profile.preferences')
            ->with('success', 'Tùy chọn đã được cập nhật thành công!');
    }

    /**
     * Enable two-factor authentication for the customer.
     */
    public function enableTwoFactorAuthentication(): \Illuminate\Http\JsonResponse
    {
        if ($this->customer->hasEnabledTwoFactorAuthentication()) {
            return response()->json(['error' => '2FA đã được bật trước đó.'], 400);
        }

        $this->customer->enableTwoFactorAuthentication();

        return response()->json([
            'message' => '2FA đã được khởi tạo. Vui lòng quét mã QR và nhập mã xác thực.',
            'qr_code' => $this->customer->twoFactorQrCodeSvg(),
            'setup_key' => decrypt($this->customer->two_factor_secret),
            'recovery_codes' => json_decode(decrypt($this->customer->two_factor_recovery_codes), true),
        ]);
    }

    /**
     * Confirm two-factor authentication for the customer.
     */
    public function confirmTwoFactorAuthentication(Request $request): RedirectResponse
    {
        $request->validate([
            'code' => ['required', 'string'],
        ], [
            'code.required' => 'Mã xác thực là bắt buộc.',
            'code.string' => 'Mã xác thực phải là chuỗi ký tự.',
        ]);

        if (!$this->customer->two_factor_secret) {
            return redirect()->back()->withErrors(['code' => 'Vui lòng bật 2FA trước khi xác nhận.']);
        }

        if ($this->customer->confirmTwoFactorAuthentication($request->code)) {
            return redirect()->route('customer.profile.security')
                ->with('success', '2FA đã được xác nhận thành công!');
        }

        return redirect()->back()->withErrors(['code' => 'Mã xác thực không chính xác.']);
    }

    /**
     * Disable two-factor authentication for the customer.
     */
    public function disableTwoFactorAuthentication(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password:customer'],
        ], [
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.current_password' => 'Mật khẩu không chính xác.',
        ]);

        $this->customer->disableTwoFactorAuthentication();

        return redirect()->route('customer.profile.security')
            ->with('success', '2FA đã được tắt thành công!');
    }

    /**
     * Get the customer's two-factor authentication recovery codes.
     */
    public function getTwoFactorRecoveryCodes(): \Illuminate\Http\JsonResponse
    {
        if (!$this->customer->hasEnabledTwoFactorAuthentication()) {
            return response()->json(['error' => '2FA chưa được bật cho tài khoản này.'], 400);
        }

        if (!$this->customer->two_factor_recovery_codes) {
            return response()->json(['error' => 'Không tìm thấy mã khôi phục.'], 404);
        }

        $recoveryCodes = json_decode(decrypt($this->customer->two_factor_recovery_codes), true);

        return response()->json([
            'recovery_codes' => $recoveryCodes,
            'message' => 'Mã khôi phục đã được tải thành công.',
        ]);
    }

    /**
     * Regenerate the customer's two-factor authentication recovery codes.
     */
    public function regenerateTwoFactorRecoveryCodes(): \Illuminate\Http\JsonResponse
    {
        if (!$this->customer->hasEnabledTwoFactorAuthentication()) {
            return response()->json(['error' => '2FA chưa được bật cho tài khoản này.'], 400);
        }

        $this->customer->replaceRecoveryCodes();

        $recoveryCodes = json_decode(decrypt($this->customer->two_factor_recovery_codes), true);

        return response()->json([
            'recovery_codes' => $recoveryCodes,
            'message' => 'Mã khôi phục đã được tạo lại thành công.',
        ]);
    }
}
