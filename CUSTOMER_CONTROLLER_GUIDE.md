# Customer Controller Base Class - Usage Guide

## Overview
`BaseCustomerController` là một abstract class cung cấp các chức năng chung cho tất cả customer controllers.

## How to Use

### 1. Extend BaseCustomerController
```php
<?php

namespace App\Http\Controllers\Customer;

use Illuminate\Http\Request;
use Inertia\Response;

class YourController extends BaseCustomerController
{
    public function index(Request $request): Response
    {
        // $this->customer is automatically available with loaded relationships
        // No need to call Auth::guard('customer')->user() or load relationships
        
        return Inertia::render('your-view', [
            'customer' => $this->customer,
        ]);
    }
}
```

### 2. Available Properties
- `$this->customer` - Authenticated customer with loaded relationships (balance, points, personalStore)

### 3. Available Helper Methods

#### `getCustomer(): Customer`
Returns the authenticated customer instance.

#### `hasBalance(float $amount): bool`
Check if customer has sufficient balance.
```php
if ($this->hasBalance(100000)) {
    // Customer has at least 100,000 VND
}
```

#### `getAvailableBalance(): float`
Get customer's available balance.
```php
$balance = $this->getAvailableBalance();
```

#### `getPendingAmount(): float`
Get customer's pending amount (money being held in transactions).
```php
$pending = $this->getPendingAmount();
```

#### `getPoints(): int`
Get customer's current points.
```php
$points = $this->getPoints();
```

### 4. Automatic Features
- ✅ Customer authentication check
- ✅ Automatic loading of relationships: balance, points, personalStore
- ✅ Available in all methods without manual loading
- ✅ Null-safe operations

### 5. Migration Guide
**Before (using Controller):**
```php
class OldController extends Controller
{
    public function index(Request $request)
    {
        $customer = Auth::guard('customer')->user();
        $customer->load(['balance', 'points', 'personalStore']);
        
        if ($customer->balance->balance < $amount) {
            // Check balance
        }
    }
}
```

**After (using BaseCustomerController):**
```php
class NewController extends BaseCustomerController
{
    public function index(Request $request)
    {
        // $this->customer is automatically available
        
        if (!$this->hasBalance($amount)) {
            // Check balance with helper method
        }
    }
}
```

### 6. Controllers Already Updated
- ✅ TransactionController
- ✅ DashboardController

### 7. Controllers That Should Be Updated
- [ ] WalletController
- [ ] ProfileController
- [ ] StoreController
- [ ] ProductController
- [ ] ChatController
- [ ] DisputeController
- [ ] PointController
- [ ] ReferralController
- [ ] SettingsController

## Benefits
- 🚀 Reduces code duplication
- 🛡️ Consistent authentication handling
- 📝 Better code maintainability
- 🎯 Type-safe customer access
- ⚡ Performance optimized (single query with eager loading)
