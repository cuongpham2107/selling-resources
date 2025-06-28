<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Support\Facades\Auth;

abstract class BaseCustomerController extends Controller
{
    protected Customer $customer;

    public function __construct()
    {
        $this->middleware('customer.auth');
        $this->middleware(function ($request, $next) {
            $this->customer = Auth::guard('customer')->user();
            if ($this->customer) {
                $this->customer->load(['balance', 'points', 'personalStore']);
            }
            return $next($request);
        });
    }

    /**
     * Get the authenticated customer
     */
    protected function getCustomer(): Customer
    {
        return $this->customer;
    }

    /**
     * Check if the customer has sufficient balance
     */
    protected function hasBalance(float $amount): bool
    {
        return $this->customer->balance && $this->customer->balance->balance >= $amount;
    }

    /**
     * Get customer's available balance
     */
    protected function getAvailableBalance(): float
    {
        return $this->customer->balance ? $this->customer->balance->balance : 0;
    }

    /**
     * Get customer's pending amount
     */
    protected function getPendingAmount(): float
    {
        return $this->customer->balance ? $this->customer->balance->pending_amount : 0;
    }

    /**
     * Get customer's points
     */
    protected function getPoints(): int
    {
        return $this->customer->points ? $this->customer->points->points : 0;
    }
}
