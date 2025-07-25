<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureCustomerEmailIsVerified
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $customer = Auth::guard('customer')->user();
        
        // if (!$customer || !$customer->hasVerifiedEmail()) {
        //     return $request->expectsJson()
        //         ? abort(403, 'Email của bạn chưa được xác thực.')
        //         : redirect()->route('customer.verification.notice');
        // }

        return $next($request);
    }
}
