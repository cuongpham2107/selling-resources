# Migration Script for Customer Controllers

## Already Updated Controllers ✅
- TransactionController
- DashboardController  
- WalletController (partially)
- ProfileController (needs completion)
- StoreController (needs completion)

## Controllers That Need Updates
- ChatController
- DisputeController
- PointController
- ProductController
- ReferralController
- SettingsController

## Quick Migration Steps for Each Controller

### 1. Update imports
```php
// Remove
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

// Change
class YourController extends Controller
// To
class YourController extends BaseCustomerController
```

### 2. Remove Auth calls
```php
// Replace ALL instances of:
$customer = Auth::guard('customer')->user();

// With:
// (remove the line completely, use $this->customer instead)
```

### 3. Replace $customer variable usage
```php
// Replace ALL instances of:
$customer->id
$customer->username
$customer->balance
// etc.

// With:
$this->customer->id
$this->customer->username
$this->customer->balance
// etc.
```

### 4. Use helper methods where applicable
```php
// Instead of:
$customer->balance->balance >= $amount

// Use:
$this->hasBalance($amount)

// Instead of:
$customer->balance ? $customer->balance->balance : 0

// Use:
$this->getAvailableBalance()
```

## Regex Patterns for Quick Find/Replace

### Find Pattern:
```regex
\$customer = Auth::guard\('customer'\)->user\(\);
```

### Replace with:
```
(empty - remove the line)
```

### Find Pattern:
```regex
\$customer->
```

### Replace with:
```
$this->customer->
```

## Manual Review Required
After automatic replacement, manually check:
1. Variable scope in closures/callbacks
2. Method parameters that pass $customer
3. Relationships that need the customer object

## Testing Checklist
After migration, test each controller for:
- ✅ Authentication works
- ✅ Balance information displays correctly  
- ✅ Customer-specific data filters properly
- ✅ No undefined variable errors
- ✅ Helper methods work as expected

## Next Priority Controllers:
1. **ChatController** - High usage
2. **DisputeController** - Important for transactions
3. **PointController** - User engagement
4. **ProductController** - Store functionality
5. **ReferralController** - Growth features
6. **SettingsController** - User preferences
