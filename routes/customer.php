<?php

use App\Http\Controllers\Customer\Auth\AuthenticatedCustomerController;
use App\Http\Controllers\Customer\Auth\RegisteredCustomerController;
use App\Http\Controllers\Customer\Auth\EmailVerificationController;
use App\Http\Controllers\Customer\Auth\PasswordResetController;
use App\Http\Controllers\Customer\GeneralChatController;
use App\Http\Controllers\Customer\TransactionChatController;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\DisputeController;
use App\Http\Controllers\Customer\MarketplaceController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\PointController;
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\ReferralController;
use App\Http\Controllers\Customer\ReportGeneralChatController;
use App\Http\Controllers\Customer\SettingsController;
use App\Http\Controllers\Customer\StoreController;
use App\Http\Controllers\Customer\StoreTransactionController;
use App\Http\Controllers\Customer\TransactionController;
use App\Http\Controllers\Customer\WalletController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;

// Guest routes - redirect to dashboard if already authenticated
Route::prefix('/')->name('customer.')->middleware('customer.guest')->group(function () {
    Route::get('register', [RegisteredCustomerController::class, 'create'])
        ->name('register');
    Route::post('register', [RegisteredCustomerController::class, 'store']);

    Route::get('login', [AuthenticatedCustomerController::class, 'create'])
        ->name('login');
    Route::post('login', [AuthenticatedCustomerController::class, 'store']);

    // Password Reset Routes
    Route::get('forgot-password', [PasswordResetController::class, 'create'])
        ->name('password.request');
    Route::post('forgot-password', [PasswordResetController::class, 'store'])
        ->name('password.email');
    Route::get('reset-password/{token}', [PasswordResetController::class, 'edit'])
        ->name('password.reset');
    Route::post('reset-password', [PasswordResetController::class, 'update'])
        ->name('password.update');
});

// Email verification routes
Route::prefix('/')->name('customer.')->group(function () {
    Route::get('email/verify', [EmailVerificationController::class, 'notice'])
        ->name('verification.notice');
    
    Route::get('email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify'])
        ->middleware('throttle:6,1')
        ->name('verification.verify');
    
    Route::post('email/verification-notification', [EmailVerificationController::class, 'send'])
        ->middleware('throttle:6,1')
        ->name('verification.send');
});

// Authenticated customer routes - redirect to login if not authenticated
Route::prefix('customer')->name('customer.')->middleware(['customer.auth', 'customer.verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');
    
    Route::post('logout', [AuthenticatedCustomerController::class, 'destroy'])
        ->name('logout');

    // Transactions
    Route::prefix('transactions')->name('transactions.')->group(function () {
        Route::get('/', [TransactionController::class, 'index'])->name('index');
        Route::get('create', [TransactionController::class, 'create'])->name('create');
        Route::post('/', [TransactionController::class, 'store'])->name('store');
        Route::get('{transaction}', [TransactionController::class, 'show'])->name('show');
        Route::patch('{transaction}', [TransactionController::class, 'update'])->name('update');
    });

    // Store routes
    Route::prefix('store')->name('store.')->group(function () {
        Route::get('/', [StoreController::class, 'index'])->name('index');
        Route::get('create', [StoreController::class, 'create'])->name('create');
        Route::post('/', [StoreController::class, 'store'])->name('store');
        Route::get('{store}/edit', [StoreController::class, 'edit'])->name('edit');
        Route::put('{store}', [StoreController::class, 'update'])->name('update');
        Route::delete('{store}', [StoreController::class, 'destroy'])->name('destroy');
        Route::get('{store}/products', [StoreController::class, 'products'])->name('products');
        Route::get('{store}/analytics', [StoreController::class, 'analytics'])->name('analytics');
        
        // Store transaction routes
        Route::prefix('transactions')->name('transactions.')->group(function () {
            Route::get('/', [StoreTransactionController::class, 'index'])->name('index');
            Route::get('{transaction}', [StoreTransactionController::class, 'show'])->name('show');
            Route::post('{transaction}/complete', [StoreTransactionController::class, 'complete'])->name('complete');
            Route::post('{transaction}/dispute', [StoreTransactionController::class, 'dispute'])->name('dispute');
        });
    });

    // Marketplace routes
    Route::prefix('marketplace')->name('marketplace.')->group(function () {
        Route::get('/', [MarketplaceController::class, 'index'])->name('index');
        Route::get('product/{product}', [MarketplaceController::class, 'show'])->name('product.show');
        Route::post('product/{product}/purchase', [MarketplaceController::class, 'purchase'])->name('product.purchase');
        Route::get('store/{store}', [MarketplaceController::class, 'store'])->name('store.show');
    });

    // Products routes (user's own products)
    Route::prefix('products')->name('products.')->group(function () {
        Route::get('/', [ProductController::class, 'index'])->name('index');
        Route::get('create', [ProductController::class, 'create'])->name('create');
        Route::post('/', [ProductController::class, 'store'])->name('store');
        Route::get('{product}', [ProductController::class, 'show'])->name('show');
        Route::get('{product}/edit', [ProductController::class, 'edit'])->name('edit');
        Route::patch('{product}', [ProductController::class, 'update'])->name('update');
        Route::delete('{product}', [ProductController::class, 'destroy'])->name('destroy');
    });

    // Chat routes
    Route::prefix('chat')->name('chat.')->group(function () {
        // General Chat routes
        Route::prefix('general')->name('general.')->group(function () {
            Route::get('/', [GeneralChatController::class, 'index'])->name('index');
            Route::get('room', [GeneralChatController::class, 'show'])->name('show');
            Route::post('/', [GeneralChatController::class, 'store'])->name('store');
            Route::get('rules', [GeneralChatController::class, 'rules'])->name('rules');
            Route::post('block', [GeneralChatController::class, 'block'])->name('block');
            Route::post('report', [GeneralChatController::class, 'report'])->name('report');
        });

        // Transaction Chat routes
        Route::prefix('transaction')->name('transaction.')->group(function () {
            Route::get('/', [TransactionChatController::class, 'index'])->name('index');
            
            // Intermediate transaction chat routes
            Route::get('intermediate/{transaction}', [TransactionChatController::class, 'showIntermediateTransaction'])->name('intermediate.show');
            Route::post('intermediate/{transaction}', [TransactionChatController::class, 'sendIntermediateTransactionMessage'])->name('intermediate.send');
            
            // Store transaction chat routes  
            Route::get('store/{transaction}', [TransactionChatController::class, 'showStoreTransaction'])->name('store.show');
            Route::post('store/{transaction}', [TransactionChatController::class, 'sendStoreTransactionMessage'])->name('store.send');
        });
    });

    // Report routes
    Route::prefix('reports')->name('reports.')->group(function () {
        Route::post('/', [ReportGeneralChatController::class, 'store'])->name('store');
    });

    // Wallet & Points routes
    Route::prefix('wallet')->name('wallet.')->group(function () {
        Route::get('/', [WalletController::class, 'index'])->name('index');
        Route::get('topup', [WalletController::class, 'topup'])->name('topup');
        Route::post('topup', [WalletController::class, 'processTopup'])->name('topup.process');
        Route::get('topup/{transaction}/status', [WalletController::class, 'topupStatus'])->name('topup.status');
        Route::get('withdraw', [WalletController::class, 'withdraw'])->name('withdraw');
        Route::post('withdraw', [WalletController::class, 'processWithdraw'])->name('withdraw.process');
        Route::get('transfer', [WalletController::class, 'transfer'])->name('transfer');
        Route::post('transfer', [WalletController::class, 'processTransfer'])->name('transfer.process');
        Route::get('history', [WalletController::class, 'history'])->name('history');

        // VNPay routes
        Route::get('vnpay/return', [WalletController::class, 'vnpayReturn'])->name('vnpay.return');
        Route::post('vnpay/callback', [WalletController::class, 'vnpayCallback'])->name('vnpay.callback');
    });

    Route::prefix('points')->name('points.')->group(function () {
        Route::get('/', [PointController::class, 'index'])->name('index');
        Route::get('exchange', [PointController::class, 'exchange'])->name('exchange');
        Route::post('exchange', [PointController::class, 'processExchange'])->name('exchange.process');
        Route::get('spend', [PointController::class, 'spend'])->name('spend');
        Route::post('spend', [PointController::class, 'processSpend'])->name('spend.process');
        Route::get('history', [PointController::class, 'history'])->name('history');
        Route::get('earn', [PointController::class, 'earn'])->name('earn');
        Route::post('earn', [PointController::class, 'claimEarning'])->name('earn.claim');
    });

    // Referrals
    Route::prefix('referrals')->name('referrals.')->group(function () {
        Route::get('/', [ReferralController::class, 'index'])->name('index');
        Route::get('share', [ReferralController::class, 'share'])->name('share');
        Route::post('regenerate', [ReferralController::class, 'regenerateCode'])->name('regenerate');
        Route::get('earnings', [ReferralController::class, 'earnings'])->name('earnings');
        Route::get('program', [ReferralController::class, 'program'])->name('program');
        Route::get('leaderboard', [ReferralController::class, 'leaderboard'])->name('leaderboard');
        Route::get('track', [ReferralController::class, 'track'])->name('track');
    });

    // Disputes
    Route::prefix('disputes')->name('disputes.')->group(function () {
        Route::get('/', [DisputeController::class, 'index'])->name('index');
        Route::get('create', [DisputeController::class, 'create'])->name('create');
        Route::post('/', [DisputeController::class, 'store'])->name('store');
        Route::get('history', [DisputeController::class, 'history'])->name('history');
        Route::get('guidelines', [DisputeController::class, 'guidelines'])->name('guidelines');
        Route::get('{dispute}', [DisputeController::class, 'show'])->name('show');
        Route::post('{dispute}/respond', [DisputeController::class, 'respond'])->name('respond');
        Route::post('{dispute}/cancel', [DisputeController::class, 'cancel'])->name('cancel');
        Route::post('{dispute}/escalate', [DisputeController::class, 'escalate'])->name('escalate');
        Route::get('{dispute}/evidence/{fileIndex}', [DisputeController::class, 'downloadEvidence'])->name('evidence.download');
    });

    // Profile & Settings
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'show'])->name('show');
        Route::get('edit', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('update', [ProfileController::class, 'update'])->name('update');
        Route::patch('password', [ProfileController::class, 'updatePassword'])->name('password.update');
        Route::delete('avatar', [ProfileController::class, 'deleteAvatar'])->name('avatar.delete');
        Route::get('activity', [ProfileController::class, 'activity'])->name('activity');
        Route::get('stats', [ProfileController::class, 'stats'])->name('stats');
        Route::get('security', [ProfileController::class, 'security'])->name('security');
        Route::get('preferences', [ProfileController::class, 'preferences'])->name('preferences');
        Route::patch('preferences', [ProfileController::class, 'updatePreferences'])->name('preferences.update');
    });
    
    Route::get('settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
    
});
