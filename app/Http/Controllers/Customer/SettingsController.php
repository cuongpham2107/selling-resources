<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends BaseCustomerController
{
    public function index(): Response
    {
        return Inertia::render('customer/Settings/Index');
    }

    public function account(): Response
    {
        
        return Inertia::render('customer/Settings/Account', [
            'customer' => $this->customer,
        ]);
    }

    public function notifications(): Response
    {
        // Get current notification settings
        $settings = [
            'email_notifications' => true,
            'transaction_alerts' => true,
            'marketing_emails' => false,
            'dispute_updates' => true,
            'referral_notifications' => true,
            'system_announcements' => true,
            'maintenance_alerts' => true,
        ];

        return Inertia::render('customer/Settings/Notifications', [
            'settings' => $settings,
        ]);
    }

    public function updateNotifications(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'email_notifications' => ['boolean'],
            'transaction_alerts' => ['boolean'],
            'marketing_emails' => ['boolean'],
            'dispute_updates' => ['boolean'],
            'referral_notifications' => ['boolean'],
            'system_announcements' => ['boolean'],
            'maintenance_alerts' => ['boolean'],
        ], [
            'email_notifications.boolean' => 'Cài đặt thông báo email phải là true hoặc false.',
            'transaction_alerts.boolean' => 'Cài đặt cảnh báo giao dịch phải là true hoặc false.',
            'marketing_emails.boolean' => 'Cài đặt email marketing phải là true hoặc false.',
            'dispute_updates.boolean' => 'Cài đặt cập nhật tranh chấp phải là true hoặc false.',
            'referral_notifications.boolean' => 'Cài đặt thông báo giới thiệu phải là true hoặc false.',
            'system_announcements.boolean' => 'Cài đặt thông báo hệ thống phải là true hoặc false.',
            'maintenance_alerts.boolean' => 'Cài đặt cảnh báo bảo trì phải là true hoặc false.',
        ]);

        // In a real app, you would store these in a user_settings table
        // For now, we'll just return success
        
        return redirect()->route('customer.settings.notifications')
            ->with('success', 'Cài đặt thông báo đã được cập nhật thành công!');
    }

    public function privacy(): Response
    {
        
        $settings = [
            'profile_visibility' => 'public', // public, friends, private
            'show_online_status' => true,
            'allow_direct_messages' => true,
            'show_transaction_count' => false,
            'show_join_date' => true,
            'allow_referral_tracking' => true,
        ];

        return Inertia::render('customer/Settings/Privacy', [
            'settings' => $settings,
        ]);
    }

    public function updatePrivacy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'profile_visibility' => ['in:public,friends,private'],
            'show_online_status' => ['boolean'],
            'allow_direct_messages' => ['boolean'],
            'show_transaction_count' => ['boolean'],
            'show_join_date' => ['boolean'],
            'allow_referral_tracking' => ['boolean'],
        ], [
            'profile_visibility.in' => 'Mức độ hiển thị hồ sơ phải là công khai, bạn bè hoặc riêng tư.',
            'show_online_status.boolean' => 'Cài đặt hiển thị trạng thái trực tuyến phải là true hoặc false.',
            'allow_direct_messages.boolean' => 'Cài đặt cho phép tin nhắn trực tiếp phải là true hoặc false.',
            'show_transaction_count.boolean' => 'Cài đặt hiển thị số lượng giao dịch phải là true hoặc false.',
            'show_join_date.boolean' => 'Cài đặt hiển thị ngày tham gia phải là true hoặc false.',
            'allow_referral_tracking.boolean' => 'Cài đặt cho phép theo dõi giới thiệu phải là true hoặc false.',
        ]);

        // Store privacy settings
        
        return redirect()->route('customer.settings.privacy')
            ->with('success', 'Cài đặt quyền riêng tư đã được cập nhật thành công!');
    }

    public function security(): Response
    {
        
        $securitySettings = [
            'two_factor_enabled' => false,
            'login_alerts' => true,
            'session_timeout' => 30, // minutes
            'require_password_confirmation' => true,
        ];

        return Inertia::render('customer/Settings/Security', [
            'settings' => $securitySettings,
            'sessions' => [
                // Active sessions would be listed here
            ],
        ]);
    }

    public function updateSecurity(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'login_alerts' => ['boolean'],
            'session_timeout' => ['integer', 'min:5', 'max:120'],
            'require_password_confirmation' => ['boolean'],
        ], [
            'login_alerts.boolean' => 'Cài đặt cảnh báo đăng nhập phải là true hoặc false.',
            'session_timeout.integer' => 'Thời gian hết phiên phải là số nguyên.',
            'session_timeout.min' => 'Thời gian hết phiên tối thiểu là 5 phút.',
            'session_timeout.max' => 'Thời gian hết phiên tối đa là 120 phút.',
            'require_password_confirmation.boolean' => 'Cài đặt yêu cầu xác nhận mật khẩu phải là true hoặc false.',
        ]);

        // Store security settings
        
        return redirect()->route('customer.settings.security')
            ->with('success', 'Cài đặt bảo mật đã được cập nhật thành công!');
    }

    public function billing(): Response
    {
        
        // Get billing information
        $billingInfo = [
            'default_payment_method' => null,
            'saved_payment_methods' => [],
            'billing_address' => null,
            'tax_id' => null,
        ];

        return Inertia::render('customer/Settings/Billing', [
            'billingInfo' => $billingInfo,
        ]);
    }

    public function api(): Response
    {
        
        // API settings (if you plan to offer API access)
        $apiSettings = [
            'api_enabled' => false,
            'api_key' => null,
            'rate_limit' => 1000, // requests per hour
            'webhooks' => [],
        ];

        return Inertia::render('customer/Settings/Api', [
            'settings' => $apiSettings,
        ]);
    }

    public function generateApiKey(): RedirectResponse
    {
        
        // Generate API key logic would go here
        
        return redirect()->route('customer.settings.api')
            ->with('success', 'Khóa API đã được tạo thành công!');
    }

    public function revokeApiKey(): RedirectResponse
    {
        
        // Revoke API key logic would go here
        
        return redirect()->route('customer.settings.api')
            ->with('success', 'Khóa API đã được thu hồi thành công!');
    }

    public function deleteAccount(): Response
    {
        return Inertia::render('customer/Settings/DeleteAccount', [
            'warnings' => [
                'This action cannot be undone',
                'All your data will be permanently deleted',
                'Active transactions will be cancelled',
                'Your store and products will be removed',
                'Pending disputes will be resolved automatically',
                'Account balance will be forfeited',
            ],
        ]);
    }

    public function confirmDeleteAccount(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'password' => ['required', 'current_password:customer'],
            'confirmation' => ['required', 'in:DELETE MY ACCOUNT'],
        ], [
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.current_password' => 'Mật khẩu không chính xác.',
            'confirmation.required' => 'Xác nhận xóa tài khoản là bắt buộc.',
            'confirmation.in' => 'Vui lòng nhập "DELETE MY ACCOUNT" để xác nhận.',
        ]);

        // Check for active transactions, disputes, etc.
        $hasActiveTransactions = $this->customer->buyerTransactions()
            ->whereIn('status', ['pending', 'in_progress'])
            ->exists();
            
        $hasActiveDisputes = $this->customer->plaintiffDisputes()
            ->whereIn('status', ['open', 'under_review'])
            ->exists();

        if ($hasActiveTransactions || $hasActiveDisputes) {
            return back()->withErrors([
                'message' => 'Không thể xóa tài khoản khi có giao dịch hoặc tranh chấp đang hoạt động. Vui lòng giải quyết chúng trước.'
            ]);
        }

        // In a real app, you would:
        // 1. Cancel all pending transactions
        // 2. Transfer any remaining balance
        // 3. Anonymize or delete user data according to your privacy policy
        // 4. Send confirmation email
        
        // For now, we'll just soft delete
        $this->customer->update([
            'is_active' => false,
            'deleted_at' => now(),
        ]);

        Auth::guard('customer')->logout();

        return redirect()->route('home')
            ->with('success', 'Tài khoản của bạn đã được xóa thành công.');
    }

    public function export(): Response
    {
        return Inertia::render('customer/Settings/Export', [
            'availableData' => [
                'profile' => 'Basic profile information',
                'transactions' => 'Transaction history',
                'messages' => 'Chat messages',
                'disputes' => 'Dispute records',
                'referrals' => 'Referral data',
            ],
        ]);
    }

    public function exportData(Request $request): RedirectResponse
    {
        
        $validated = $request->validate([
            'data_types' => ['required', 'array'],
            'data_types.*' => ['in:profile,transactions,messages,disputes,referrals'],
            'format' => ['required', 'in:json,csv'],
        ], [
            'data_types.required' => 'Loại dữ liệu cần xuất là bắt buộc.',
            'data_types.array' => 'Loại dữ liệu phải là một mảng.',
            'data_types.*.in' => 'Loại dữ liệu không hợp lệ.',
            'format.required' => 'Định dạng xuất dữ liệu là bắt buộc.',
            'format.in' => 'Định dạng xuất dữ liệu phải là JSON hoặc CSV.',
        ]);

        // Generate export file
        // This would typically be queued as a job for large datasets
        
        return redirect()->route('customer.settings.export')
            ->with('success', 'Yêu cầu xuất dữ liệu đã được xếp hàng. Bạn sẽ nhận được email khi hoàn thành.');
    }
}
