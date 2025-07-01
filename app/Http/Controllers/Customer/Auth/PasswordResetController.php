<?php

namespace App\Http\Controllers\Customer\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\Customer;

class PasswordResetController extends Controller
{
    /**
     * Display the password reset link request view.
     */
    public function create(): Response
    {
        return Inertia::render('customer/auth/ForgotPassword', [
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming password reset link request.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => 'required|email',
        ], [
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email phải có định dạng hợp lệ.',
        ]);

        // Check if customer exists
        $customer = Customer::where('email', $request->email)->first();
        if (!$customer) {
            throw ValidationException::withMessages([
                'email' => 'Không tìm thấy tài khoản với email này.',
            ]);
        }

        // Check if customer is active
        if (!$customer->is_active) {
            throw ValidationException::withMessages([
                'email' => 'Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước.',
            ]);
        }

        // We will send the password reset link to this user. Once we have attempted
        // to send the link, we will examine the response then see the message we
        // need to show to the user. Finally, we'll send out a proper response.
        $status = Password::broker('customers')->sendResetLink(
            $request->only('email')
        );

        if ($status == Password::RESET_LINK_SENT) {
            return back()->with('status', 'Đã gửi link đặt lại mật khẩu đến email của bạn!');
        }

        throw ValidationException::withMessages([
            'email' => 'Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.',
        ]);
    }

    /**
     * Display the password reset view.
     */
    public function edit(Request $request): Response
    {
        return Inertia::render('customer/auth/ResetPassword', [
            'email' => $request->email,
            'token' => $request->route('token'),
        ]);
    }

    /**
     * Handle an incoming new password request.
     */
    public function update(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => 'required',
            'email' => 'required|email',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ], [
            'token.required' => 'Token không hợp lệ.',
            'email.required' => 'Email là bắt buộc.',
            'email.email' => 'Email phải có định dạng hợp lệ.',
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
        ]);

        // Here we will attempt to reset the user's password. If it is successful we
        // will update the password on an actual user model and persist it to the
        // database. Otherwise we will parse the error and return the response.
        $status = Password::broker('customers')->reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($customer) use ($request) {
                $customer->forceFill([
                    'password' => Hash::make($request->password),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($customer));
            }
        );

        if ($status == Password::PASSWORD_RESET) {
            return redirect()->route('customer.login')->with('status', 'Mật khẩu đã được đặt lại thành công!');
        }

        throw ValidationException::withMessages([
            'email' => $this->getErrorMessage($status),
        ]);
    }

    /**
     * Get the error message for password reset status.
     */
    private function getErrorMessage(string $status): string
    {
        return match ($status) {
            Password::RESET_LINK_SENT => 'Đã gửi link đặt lại mật khẩu!',
            Password::RESET_THROTTLED => 'Vui lòng đợi trước khi yêu cầu link mới.',
            Password::INVALID_TOKEN => 'Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
            Password::INVALID_USER => 'Không tìm thấy tài khoản với email này.',
            default => 'Có lỗi xảy ra. Vui lòng thử lại.',
        };
    }
}
