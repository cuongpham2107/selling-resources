<?php

use App\Http\Controllers\LegalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('customer.login');
})->middleware('customer.guest')->name('home');

// Legal pages - accessible to everyone
Route::get('/terms', [LegalController::class, 'terms'])->name('terms');
Route::get('/privacy', [LegalController::class, 'privacy'])->name('privacy');

require __DIR__.'/settings.php';
require __DIR__.'/customer.php';

// Fallback route - redirect any undefined routes to home page
Route::fallback(function () {
    return redirect()->route('home');
});
