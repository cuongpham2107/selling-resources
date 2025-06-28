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
            ->with('product:id,name')
            ->latest()
            ->limit(10)
            ->get();

        return Inertia::render('customer/Profile/Activity', [
            'recentTransactions' => $recentTransactions,
            'recentSales' => $recentSales,
        ]);
    }

    public function stats(): Response
    {
        
        // Calculate various statistics
        $stats = [
            'member_since' => $this->customer->created_at,
            'total_purchases' => $this->customer->buyerTransactions()->where('status', 'completed')->count(),
            'total_sales' => $this->customer->sellerTransactions()->where('status', 'completed')->count(),
            'total_spent' => $this->customer->buyerTransactions()->where('status', 'completed')->sum('amount'),
            'total_earned' => $this->customer->sellerTransactions()->where('status', 'completed')->sum('amount'),
            'current_balance' => $this->customer->balance ? $this->customer->balance->available_balance : 0,
            'current_points' => $this->customer->points ? $this->customer->points->available_points : 0,
            'total_referrals' => $this->customer->referrals()->count(),
            'disputes_filed' => $this->customer->plaintiffDisputes()->count(),
            'disputes_received' => $this->customer->defendantDisputes()->count(),
        ];

        return Inertia::render('customer/Profile/Stats', [
            'stats' => $stats,
        ]);
    }

    public function security(): Response
    {
        
        // Get security-related information
        $securityInfo = [
            'last_login' => $this->customer->last_login_at,
            'last_password_change' => $customer->password_changed_at ?? $this->customer->created_at,
            'two_factor_enabled' => false, // This would be implemented if 2FA is added
            'login_attempts' => [], // Recent login attempts
        ];

        return Inertia::render('customer/Profile/Security', [
            'securityInfo' => $securityInfo,
        ]);
    }

    public function preferences(): Response
    {
        
        return Inertia::render('customer/Profile/Preferences', [
            'preferences' => [
                'notifications' => [
                    'email_notifications' => true,
                    'transaction_updates' => true,
                    'marketing_emails' => false,
                    'dispute_notifications' => true,
                ],
                'privacy' => [
                    'show_online_status' => true,
                    'allow_direct_messages' => true,
                    'show_transaction_history' => false,
                ],
                'display' => [
                    'theme' => 'light',
                    'language' => 'en',
                    'timezone' => 'UTC',
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
}
