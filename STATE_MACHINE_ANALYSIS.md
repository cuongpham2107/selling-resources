# Phân tích và Đề xuất State Machine cho Giao dịch

## 📊 Phân tích hiện trạng

### 1. Hệ thống hiện tại
Hiện tại hệ thống đang sử dụng:
- **Manual status updates** trong controller
- **Enum-based status** với validation logic
- **Database transactions** để đảm bảo consistency
- **Custom validation methods** trong enum (canBeCompleted, canBeDisputed, etc.)

### 2. Điểm mạnh của thiết kế hiện tại
- ✅ **Enum-based status** đã rất tốt và chuẩn bị sẵn cho state machine
- ✅ **State transition logic** đã được định nghĩa trong enum (getNextStates)
- ✅ **Business logic validation** đã có trong enum methods
- ✅ **Database consistency** được đảm bảo bằng transactions
- ✅ **Proper error handling** và rollback mechanisms

### 3. Vấn đề cần cải thiện
- ❌ **Code duplication** trong các controller methods
- ❌ **Manual status updates** dễ gây lỗi và bypass validation
- ❌ **Mixed business logic** giữa controller và model
- ❌ **Hard to track** state changes và audit trail
- ❌ **Testing complexity** khi phải mock nhiều scenarios

## 🎯 Lợi ích của State Machine

### 1. Centralized State Management
- **Single source of truth** cho state transitions
- **Automatic validation** của state changes
- **Consistent behavior** across toàn bộ application

### 2. Enhanced Security & Integrity
- **Prevent invalid transitions** bằng framework level
- **Automatic rollback** khi transition fails
- **Built-in audit trail** cho mọi state changes

### 3. Better Code Organization
- **Separation of concerns** giữa business logic và controller logic
- **Reusable transition logic** có thể dùng từ nhiều nơi
- **Easier testing** với dedicated transition tests

### 4. Advanced Features
- **Conditional transitions** dựa trên complex business rules
- **Before/After hooks** cho notifications, logging, etc.
- **State history tracking** tự động
- **Bulk state operations** an toàn

## 🏗️ Implementation Plan

### Phase 1: Installation & Setup (30 phút)

```bash
composer require spatie/laravel-model-states
php artisan vendor:publish --provider="Spatie\ModelStates\ModelStatesServiceProvider" --tag="migrations"
```

### Phase 2: Tạo State Classes (1 giờ)

#### IntermediateTransaction States
```php
// app/States/IntermediateTransaction/IntermediateTransactionState.php
abstract class IntermediateTransactionState extends State
{
    abstract public function getLabel(): string;
    abstract public function getColor(): string;
    abstract public function canTransitionTo(string $stateClass): bool;
}

// app/States/IntermediateTransaction/PendingState.php
class PendingState extends IntermediateTransactionState
{
    public function getLabel(): string { return 'Đang chờ xác nhận'; }
    public function getColor(): string { return 'warning'; }
    
    public function canTransitionTo(string $stateClass): bool
    {
        return in_array($stateClass, [
            ConfirmedState::class,
            CancelledState::class,
        ]);
    }
}

// Tương tự cho: ConfirmedState, SellerSentState, CompletedState, DisputedState, CancelledState
```

#### StoreTransaction States
```php
// Tương tự cho StoreTransaction với ProcessingState, CompletedState, DisputedState, CancelledState
```

### Phase 3: Tạo Transitions (1.5 giờ)

```php
// app/States/IntermediateTransaction/Transitions/ConfirmTransition.php
class ConfirmTransition extends Transition
{
    private IntermediateTransaction $transaction;
    
    public function __construct(IntermediateTransaction $transaction)
    {
        $this->transaction = $transaction;
    }
    
    public function handle(): IntermediateTransactionState
    {
        // Business logic cho confirm
        // Có thể gọi services, send notifications, etc.
        
        return new ConfirmedState($this->transaction);
    }
    
    public function canTransition(): bool
    {
        // Validation logic
        return $this->transaction->buyer_id === auth()->id() 
            && $this->transaction->status instanceof PendingState;
    }
}

// Transitions khác: MarkAsShippedTransition, MarkAsReceivedTransition, DisputeTransition, CancelTransition
```

### Phase 4: Cập nhật Models (45 phút)

```php
// app/Models/IntermediateTransaction.php
use Spatie\ModelStates\HasStates;

class IntermediateTransaction extends Model
{
    use HasStates;
    
    protected $casts = [
        'status' => IntermediateTransactionState::class,
    ];
    
    // Transition methods
    public function confirm(): void
    {
        $this->status->transitionTo(ConfirmedState::class, new ConfirmTransition($this));
    }
    
    public function markAsShipped(): void
    {
        $this->status->transitionTo(SellerSentState::class, new MarkAsShippedTransition($this));
    }
    
    // ... other transition methods
}
```

### Phase 5: Refactor Controllers (1 giờ)

```php
// app/Http/Controllers/Customer/TransactionController.php
private function confirmTransaction(IntermediateTransaction $transaction, Customer $customer): RedirectResponse
{
    try {
        // Thay vì manual update, dùng state machine
        $transaction->confirm();
        
        return redirect()->back()->with('success', 'Giao dịch đã được xác nhận!');
    } catch (InvalidStateTransition $e) {
        return redirect()->back()->withErrors(['message' => $e->getMessage()]);
    } catch (\Exception $e) {
        return redirect()->back()->withErrors(['message' => 'Có lỗi xảy ra khi xác nhận giao dịch.']);
    }
}
```

### Phase 6: Cập nhật Filament Resources (30 phút)

```php
// Cập nhật form và table để sử dụng state machine
// Thêm action buttons dựa trên available transitions
// Cập nhật badges để hiển thị state labels và colors
```

### Phase 7: Testing & Migration (1 giờ)

```php
// Tạo migration để chuyển đổi existing data
// Viết tests cho từng transition
// Test integration với Filament
```

## 🔧 Chi tiết Technical Implementation

### 1. State Machine Configuration

```php
// config/model-states.php
return [
    'default_transition' => null,
    'transition_validators' => [
        App\States\TransitionValidators\UserPermissionValidator::class,
        App\States\TransitionValidators\BusinessRuleValidator::class,
    ],
    'state_serializer' => [
        'enum' => true, // Tương thích với enum hiện tại
    ],
];
```

### 2. Advanced Transition Logic

```php
// app/States/IntermediateTransaction/Transitions/MarkAsReceivedTransition.php
class MarkAsReceivedTransition extends Transition
{
    public function handle(): IntermediateTransactionState
    {
        DB::transaction(function () {
            // Transfer money to seller
            $this->transferMoneyToSeller();
            
            // Update point transactions
            $this->processReferralBonus();
            
            // Send notifications
            $this->sendCompletionNotifications();
            
            // Log transaction completion
            $this->logCompletion();
        });
        
        return new CompletedState($this->transaction);
    }
    
    private function transferMoneyToSeller(): void
    {
        // Implementation
    }
    
    private function processReferralBonus(): void
    {
        // Implementation cho referral bonus
    }
}
```

### 3. Integration với Filament

```php
// app/Filament/Resources/IntermediateTransactions/Pages/ViewIntermediateTransaction.php
protected function getHeaderActions(): array
{
    $actions = [EditAction::make()->label('Chỉnh sửa')];
    
    // Dynamic actions dựa trên current state
    if ($this->record->status->canTransitionTo(ConfirmedState::class)) {
        $actions[] = Action::make('confirm')
            ->label('Xác nhận giao dịch')
            ->icon('heroicon-o-check')
            ->color('success')
            ->action(fn () => $this->record->confirm());
    }
    
    if ($this->record->status->canTransitionTo(SellerSentState::class)) {
        $actions[] = Action::make('mark_shipped')
            ->label('Đánh dấu đã gửi')
            ->icon('heroicon-o-truck')
            ->color('info')
            ->action(fn () => $this->record->markAsShipped());
    }
    
    return $actions;
}
```

### 4. Event Hooks

```php
// app/States/IntermediateTransaction/Transitions/ConfirmTransition.php
public function handle(): IntermediateTransactionState
{
    // Before transition hook
    event(new TransactionConfirming($this->transaction));
    
    $newState = new ConfirmedState($this->transaction);
    
    // After transition hook
    event(new TransactionConfirmed($this->transaction));
    
    return $newState;
}
```

## 📋 Migration Strategy

### 1. Backward Compatibility
```php
// Giữ enum methods để backward compatibility
public function canBeCompleted(): bool
{
    return $this->status->canTransitionTo(CompletedState::class);
}
```

### 2. Gradual Migration
- Phase 1: Cài đặt state machine song song với enum
- Phase 2: Chuyển từng controller method một
- Phase 3: Remove old enum logic
- Phase 4: Optimize và refactor

### 3. Data Migration
```php
// database/migrations/xxxx_migrate_transaction_states.php
public function up()
{
    // Chuyển đổi existing enum values sang state machine format
    // Ensure data integrity
}
```

## 🧪 Testing Strategy

### 1. Unit Tests cho States
```php
// tests/Unit/States/IntermediateTransactionStateTest.php
public function test_can_transition_from_pending_to_confirmed()
{
    $transaction = IntermediateTransaction::factory()->pending()->create();
    
    $this->assertTrue($transaction->status->canTransitionTo(ConfirmedState::class));
    
    $transaction->confirm();
    
    $this->assertInstanceOf(ConfirmedState::class, $transaction->fresh()->status);
}
```

### 2. Integration Tests
```php
// tests/Feature/TransactionStateMachineTest.php
public function test_complete_transaction_flow()
{
    // Test full flow: pending -> confirmed -> shipped -> completed
}
```

### 3. Filament Tests
```php
// tests/Feature/Filament/TransactionResourceTest.php
public function test_state_specific_actions_are_shown()
{
    // Test dynamic actions based on states
}
```

## 🎉 Expected Outcomes

### 1. Code Quality Improvements
- **50% reduction** trong controller code complexity
- **90% elimination** của manual status validation
- **100% prevention** của invalid state transitions

### 2. Developer Experience
- **Easier debugging** với clear state transition logs
- **Faster development** với reusable transition logic
- **Better testing** với focused unit tests

### 3. Business Benefits
- **Enhanced data integrity** với automatic validation
- **Audit trail** cho compliance requirements
- **Flexible workflow** cho future business rule changes

## 📅 Timeline Estimate

| Phase | Duration | Description |
|-------|----------|-------------|
| 1 | 30 min | Installation & basic setup |
| 2 | 1 hour | Create state classes |
| 3 | 1.5 hours | Implement transitions |
| 4 | 45 min | Update models |
| 5 | 1 hour | Refactor controllers |
| 6 | 30 min | Update Filament resources |
| 7 | 1 hour | Testing & migration |
| **Total** | **5.75 hours** | Complete implementation |

## 🚀 Next Steps

1. **Approve implementation plan**
2. **Install Spatie Laravel Model States**
3. **Create state classes cho IntermediateTransaction**
4. **Implement first transition (Confirm)**
5. **Test và iterate**
6. **Scale to remaining transitions**
7. **Apply same pattern cho StoreTransaction**

---

*Tài liệu này được tạo dựa trên phân tích chi tiết code hiện tại và best practices của Spatie Laravel Model States. Mọi implementation sẽ đảm bảo tương thích ngược và không ảnh hưởng đến logic nghiệp vụ hiện tại.*
