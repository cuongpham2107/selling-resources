<?php

namespace App\Http\Controllers\Customer\Auth;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\CustomerBalance;
use App\Models\CustomerPoint;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredCustomerController extends Controller
{
    /**
     * Show the registration page.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        // Check if referral code is provided in the query string
        $referralCode = $request->query('ref');
        // If referral code is provided, validate it
        if ($referralCode) {
            $validator = $request->validate([
                'referral_code' => 'exists:customers,referral_code',
            ]);
            // Check if the referral code exists in the database
            $referrer = Customer::where('referral_code', $referralCode)->first();
            if (!$referrer) {
                return redirect()->route('customer.register')->withErrors(['referral_code' => 'Mã giới thiệu không hợp lệ hoặc không tồn tại.']);
            }
            // If valid, pass it to the registration view
            $request->merge(['referral_code' => $referralCode]);    
           
            
        }
        return Inertia::render('customer/Register', [
            'referralCode' => $request->query('ref'),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'username' => 'required|string|max:255|unique:customers',
            'email' => 'required|string|lowercase|email|max:255|unique:customers',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'phone' => 'nullable|string|max:20',
            'referral_code' => 'nullable|string|exists:customers,referral_code',
        ], [
            'username.required' => 'Tên người dùng là bắt buộc.',
            'username.string' => 'Tên người dùng phải là chuỗi ký tự.',
            'username.max' => 'Tên người dùng không được vượt quá 255 ký tự.',
            'username.unique' => 'Tên người dùng này đã được sử dụng. Vui lòng chọn tên khác.',
            'email.required' => 'Email là bắt buộc.',
            'email.string' => 'Email phải là chuỗi ký tự.',
            'email.lowercase' => 'Email phải ở dạng chữ thường.',
            'email.email' => 'Email phải có định dạng hợp lệ.',
            'email.max' => 'Email không được vượt quá 255 ký tự.',
            'email.unique' => 'Email này đã được đăng ký bởi tài khoản khác.',
            'password.required' => 'Mật khẩu là bắt buộc.',
            'password.confirmed' => 'Xác nhận mật khẩu không khớp.',
            'password.min' => 'Mật khẩu phải có ít nhất 8 ký tự.',
            'phone.string' => 'Số điện thoại phải là chuỗi ký tự.',
            'phone.max' => 'Số điện thoại không được vượt quá 20 ký tự.',
            'referral_code.string' => 'Mã giới thiệu phải là chuỗi ký tự.',
            'referral_code.exists' => 'Mã giới thiệu không tồn tại trong hệ thống.',
        ]);

        // Generate unique referral code
        do {
            $referralCode = strtoupper(Str::random(8));
        } while (Customer::where('referral_code', $referralCode)->exists());

        // Find referrer if referral code provided
        $referrer = null;
        if ($request->referral_code) {
            $referrer = Customer::where('referral_code', $request->referral_code)->first();
        }

        $customer = Customer::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'referral_code' => $referralCode,
            'referred_by' => $referrer?->id,
            'is_active' => true,
        ]);

        // Create customer balance with 0 VND
        CustomerBalance::create([
            'customer_id' => $customer->id,
            'balance' => 0,
            'pending_amount' => 0,
            'daily_limit' => 10000000, // 10M VND default limit
        ]);

        // Create customer points with 0 C
        CustomerPoint::create([
            'customer_id' => $customer->id,
            'points' => 0,
            'total_earned' => 0,
            'total_spent' => 0,
        ]);

        // Create referral record if referred
        if ($referrer) {
            \App\Models\Referral::create([
                'referrer_id' => $referrer->id,
                'referred_id' => $customer->id,
                'referral_code' => $request->referral_code,
                'total_points_earned' => 0,
                'first_transaction_bonus_given' => false,
            ]);
        }

        event(new Registered($customer));

        Auth::guard('customer')->login($customer);

        return redirect()->route('customer.dashboard');
    }
}
