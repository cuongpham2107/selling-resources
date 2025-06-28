<?php

use App\Http\Controllers\Customer\Auth\AuthenticatedCustomerController;
use App\Http\Controllers\Customer\Auth\RegisteredCustomerController;
use App\Http\Controllers\Customer\ChatController;
use App\Http\Controllers\Customer\DashboardController;
use App\Http\Controllers\Customer\DisputeController;
use App\Http\Controllers\Customer\PaymentController;
use App\Http\Controllers\Customer\PointController;
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Customer\ProfileController;
use App\Http\Controllers\Customer\ReferralController;
use App\Http\Controllers\Customer\SettingsController;
use App\Http\Controllers\Customer\StoreController;
use App\Http\Controllers\Customer\TransactionController;
use App\Http\Controllers\Customer\WalletController;
use Illuminate\Support\Facades\Route;

// Guest routes - redirect to dashboard if already authenticated
Route::prefix('customer')->name('customer.')->middleware('customer.guest')->group(function () {
    Route::get('register', [RegisteredCustomerController::class, 'create'])
        ->name('register');
    Route::post('register', [RegisteredCustomerController::class, 'store']);

    Route::get('login', [AuthenticatedCustomerController::class, 'create'])
        ->name('login');
    Route::post('login', [AuthenticatedCustomerController::class, 'store']);
});

// Authenticated customer routes - redirect to login if not authenticated
Route::prefix('customer')->name('customer.')->middleware('customer.auth')->group(function () {
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
    });

    // Products routes
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
        Route::get('/', [ChatController::class, 'index'])->name('index');
        Route::get('general', [ChatController::class, 'general'])->name('general');
        Route::post('general', [ChatController::class, 'createGeneral'])->name('general.create');
        Route::get('transaction', [ChatController::class, 'transaction'])->name('transaction');
        Route::get('transaction/{transaction}', [ChatController::class, 'showTransaction'])->name('transaction.show');
        Route::post('transaction/{transaction}', [ChatController::class, 'sendTransactionMessage'])->name('transaction.send');
        Route::get('transaction/{transaction}/detail', [ChatController::class, 'transactionDetail'])->name('transaction.detail');
        Route::post('transaction/{transaction}/detail', [ChatController::class, 'sendTransactionDetailMessage'])->name('transaction.detail.send');
        Route::get('rules', [ChatController::class, 'rules'])->name('rules');
        Route::post('block', [ChatController::class, 'block'])->name('block');
        Route::post('report', [ChatController::class, 'report'])->name('report');
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
        Route::post('convert', [PointController::class, 'convertToVND'])->name('convert');
        Route::post('send', [PointController::class, 'send'])->name('send');
    });

    // Referrals
    Route::prefix('referrals')->name('referrals.')->group(function () {
        Route::get('/', [ReferralController::class, 'index'])->name('index');
    });

    // Disputes
    Route::prefix('disputes')->name('disputes.')->group(function () {
        Route::get('/', [DisputeController::class, 'index'])->name('index');
        Route::get('create', [DisputeController::class, 'create'])->name('create');
        Route::post('/', [DisputeController::class, 'store'])->name('store');
        Route::get('{dispute}', [DisputeController::class, 'show'])->name('show');
    });

    // Profile & Settings
    Route::get('profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::get('settings', [SettingsController::class, 'index'])->name('settings');
    Route::patch('settings', [SettingsController::class, 'update'])->name('settings.update');
});
