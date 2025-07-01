<?php

namespace App\Providers;

use App\Actions\Fortify\UpdateCustomerPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Laravel\Fortify\Fortify;

class FortifyServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // We only want to use 2FA features, not auth features since we have custom auth
        Fortify::updateUserPasswordsUsing(UpdateCustomerPassword::class);

        // Define the login view to redirect to customer login
        Fortify::loginView(function () {
            return redirect('/login');
        });

        // Define 2FA challenge view - we'll create this later
        Fortify::twoFactorChallengeView(function () {
            return inertia('customer/Auth/TwoFactorChallenge');
        });

        // Define 2FA confirmation view - we'll create this later  
        Fortify::confirmPasswordView(function () {
            return inertia('customer/Profile/ConfirmPassword');
        });

        RateLimiter::for('login', function (Request $request) {
            $throttleKey = Str::transliterate(Str::lower($request->input(Fortify::username())).'|'.$request->ip());

            return Limit::perMinute(5)->by($throttleKey);
        });

        RateLimiter::for('two-factor', function (Request $request) {
            return Limit::perMinute(5)->by($request->session()->get('login.id'));
        });
    }
}
