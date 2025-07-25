<?php

namespace App\Http\Requests\Customer\Auth;

use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'username' => ['required', 'string'],
            'password' => ['required', 'string'],
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        // Try username or email
        $username = $this->input('username');
        $loginField = filter_var($username, FILTER_VALIDATE_EMAIL) ? 'email' : 'username';
        
        if (! Auth::guard('customer')->attempt([$loginField => $username, 'password' => $this->input('password')], $this->boolean('remember'))) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'username' => 'Thông tin được cung cấp không phù hợp với hồ sơ của chúng tôi.',
            ]);
        }

        // Check if email is verified
        $customer = Auth::guard('customer')->user();
        
        if (!$customer->is_active) {
            Auth::guard('customer')->logout();
            
            throw ValidationException::withMessages([
                'username' => 'Tài khoản của bạn chưa được kích hoạt. Vui lòng xác thực email để kích hoạt tài khoản.',
            ]);
        }
        
        // if (!$customer->hasVerifiedEmail()) {
        //     Auth::guard('customer')->logout();
        //     throw ValidationException::withMessages([
        //         'username' => 'Email của bạn chưa được xác thực. Vui lòng kiểm tra hộp thư để xác thực tài khoản.',
        //     ]);
        // }

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), 5)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());

        throw ValidationException::withMessages([
            'username' => 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau '.$seconds.' giây.',
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(Str::lower($this->input('username', '')).'|'.request()->ip());
    }
}
