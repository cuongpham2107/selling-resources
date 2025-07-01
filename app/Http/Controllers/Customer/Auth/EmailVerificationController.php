<?php

namespace App\Http\Controllers\Customer\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Http\Requests\Customer\Auth\EmailVerificationRequest as CustomerEmailVerificationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\Customer;
use Inertia\Inertia;
use Inertia\Response;

class EmailVerificationController extends Controller
{
    /**
     * Display the email verification notice.
     */
    public function notice(Request $request): Response|RedirectResponse
    {
        // If user is logged in and already verified, redirect to dashboard
        if ($request->user('customer') && $request->user('customer')->hasVerifiedEmail()) {
            return redirect()->route('customer.dashboard');
        }

        return Inertia::render('customer/auth/VerifyEmail', [
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Mark the authenticated user's email address as verified.
     */
    public function verify(Request $request): RedirectResponse
    {
        // Get customer by ID from the verification URL
        $customer = Customer::find($request->route('id'));
        
        if (!$customer) {
            return redirect()->route('customer.verification.notice')
                ->withErrors(['email' => 'Tài khoản không tồn tại.']);
        }
        
        // Verify the hash manually
        $hash = sha1($customer->getEmailForVerification());
        if (!hash_equals((string) $request->route('hash'), $hash)) {
            return redirect()->route('customer.verification.notice')
                ->withErrors(['email' => 'Link xác thực không hợp lệ hoặc đã hết hạn.']);
        }
        
        // Check if email is already verified
        if ($customer->hasVerifiedEmail()) {
            return redirect()->route('customer.login')
                ->with('status', 'Email đã được xác thực trước đó. Bạn có thể đăng nhập ngay.');
        }

        // Mark email as verified
        if ($customer instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && $customer->markEmailAsVerified()) {
            event(new Verified($customer));
        }

        // Activate the customer account after email verification
        $customer->update(['is_active' => true]);

        // Auto login the customer after verification
        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.dashboard')
            ->with('status', 'Email đã được xác thực thành công! Chào mừng bạn đến với hệ thống.');
    }

    /**
     * Send a new email verification notification.
     */
    public function send(Request $request): RedirectResponse
    {
        // Allow resending verification email even if not logged in
        // Get customer by email if not logged in
        $customer = $request->user('customer');
        
        if (!$customer) {
            // If not logged in, try to find customer by email from session or request
            $email = $request->input('email') ?: session('registration_email');
            if (!$email) {
                return redirect()->route('customer.login')
                    ->withErrors(['email' => 'Vui lòng đăng nhập hoặc cung cấp email để gửi lại xác thực.']);
            }
            
            $customer = Customer::where('email', $email)->first();
            if (!$customer) {
                return redirect()->route('customer.login')
                    ->withErrors(['email' => 'Không tìm thấy tài khoản với email này.']);
            }
        }

        if ($customer->hasVerifiedEmail()) {
            return redirect()->route('customer.dashboard');
        }

        $customer->sendEmailVerificationNotification();

        return back()->with('status', 'Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.');
    }
}
