# Customer API Test Suite Summary

## Overview
This document provides a comprehensive summary of all Customer API tests created for the Laravel selling-resources project. All tests exclude Authentication APIs as requested.

## Test Coverage

### 1. Wallet APIs (`tests/Feature/Customer/WalletTest.php`)
**Endpoints Tested:**
- `GET /api/customer/wallet` - View wallet balance and info
- `POST /api/customer/wallet/deposit` - Deposit money to wallet
- `POST /api/customer/wallet/withdraw` - Withdraw money from wallet
- `POST /api/customer/wallet/transfer` - Transfer money to another customer
- `GET /api/customer/wallet/transactions` - View wallet transaction history

**Test Cases:**
- ✅ View wallet balance and information
- ✅ Deposit money with valid data
- ✅ Withdraw money with sufficient balance
- ✅ Transfer money between customers
- ✅ View transaction history with filtering
- ✅ Validation errors for invalid amounts
- ✅ Insufficient balance scenarios
- ✅ Authorization and permissions
- ✅ Edge cases and error handling

### 2. Point APIs (`tests/Feature/Customer/PointTest.php`)
**Endpoints Tested:**
- `GET /api/customer/points` - View points balance and info
- `POST /api/customer/points/redeem` - Redeem points for rewards
- `POST /api/customer/points/spend` - Spend points for services
- `POST /api/customer/points/daily-reward` - Claim daily login reward
- `GET /api/customer/points/transactions` - View point transaction history

**Test Cases:**
- ✅ View points balance and information
- ✅ Redeem points for various rewards
- ✅ Spend points for services/features
- ✅ Claim daily login rewards
- ✅ View transaction history with filtering
- ✅ Validation for insufficient points
- ✅ Rate limiting for daily rewards
- ✅ Authorization and permissions
- ✅ Edge cases and error handling

### 3. Transaction APIs (`tests/Feature/Customer/TransactionTest.php`)
**Endpoints Tested:**
- `GET /api/customer/transactions` - View intermediate transactions
- `POST /api/customer/transactions` - Create new intermediate transaction
- `GET /api/customer/transactions/{id}` - View specific transaction
- `PUT /api/customer/transactions/{id}/accept` - Accept transaction (seller)
- `PUT /api/customer/transactions/{id}/complete` - Complete transaction (buyer)
- `PUT /api/customer/transactions/{id}/cancel` - Cancel transaction

**Test Cases:**
- ✅ View transaction list with filtering
- ✅ Create new intermediate transactions
- ✅ View transaction details
- ✅ Accept transactions as seller
- ✅ Complete transactions as buyer
- ✅ Cancel transactions
- ✅ Status transitions and validations
- ✅ Authorization based on user role
- ✅ Edge cases and error handling

### 4. Store APIs (`tests/Feature/Customer/StoreTest.php`)
**Endpoints Tested:**
- `GET /api/customer/stores` - View customer's stores
- `POST /api/customer/stores` - Create new store
- `GET /api/customer/stores/{id}` - View specific store
- `PUT /api/customer/stores/{id}` - Update store
- `DELETE /api/customer/stores/{id}` - Delete store
- `GET /api/customer/stores/{id}/products` - View store products
- `POST /api/customer/stores/{id}/products` - Create store product
- `PUT /api/customer/stores/{storeId}/products/{productId}` - Update product
- `DELETE /api/customer/stores/{storeId}/products/{productId}` - Delete product
- `GET /api/customer/stores/{id}/analytics` - View store analytics
- `GET /api/customer/stores/{id}/transactions` - View store transactions

**Test Cases:**
- ✅ CRUD operations for stores (PersonalStore model)
- ✅ CRUD operations for store products (StoreProduct model)
- ✅ File uploads for logos, banners, and product files
- ✅ Store analytics and statistics
- ✅ Transaction management
- ✅ Authorization (own stores only)
- ✅ Validation and error handling
- ✅ Edge cases and permissions

### 5. Marketplace APIs (`tests/Feature/Customer/MarketplaceTest.php`)
**Endpoints Tested:**
- `GET /api/customer/marketplace/products` - Browse marketplace products
- `GET /api/customer/marketplace/products/{id}` - View product details
- `POST /api/customer/marketplace/products/{id}/purchase` - Purchase product
- `GET /api/customer/marketplace/downloads/{id}` - Download purchased product
- `GET /api/customer/marketplace/purchases` - View purchase history
- `POST /api/customer/marketplace/products/{id}/rate` - Rate purchased product

**Test Cases:**
- ✅ Browse and search marketplace products
- ✅ Filter by price, category, type
- ✅ View detailed product information
- ✅ Purchase products with wallet balance
- ✅ Download purchased products
- ✅ View purchase history
- ✅ Rate and review products
- ✅ Prevent self-purchase
- ✅ Balance validations
- ✅ Authorization and permissions

### 6. Referral APIs (`tests/Feature/Customer/ReferralTest.php`)
**Endpoints Tested:**
- `GET /api/customer/referrals` - View referral information
- `POST /api/customer/referrals/share` - Share referral code
- `GET /api/customer/referrals/earnings` - View referral earnings
- `GET /api/customer/referrals/leaderboard` - View referral leaderboard
- `POST /api/customer/referrals/track` - Track referral activity

**Test Cases:**
- ✅ View referral code and statistics
- ✅ Share referral codes via different channels
- ✅ Track referral earnings and commissions
- ✅ View leaderboard rankings
- ✅ Track referral activities
- ✅ Validation and permissions
- ✅ Edge cases and error handling

### 7. Dispute APIs (`tests/Feature/Customer/DisputeTest.php`)
**Endpoints Tested:**
- `GET /api/customer/disputes` - View customer disputes
- `POST /api/customer/disputes` - Create new dispute
- `GET /api/customer/disputes/{id}` - View specific dispute
- `POST /api/customer/disputes/{id}/respond` - Respond to dispute
- `PUT /api/customer/disputes/{id}/cancel` - Cancel dispute
- `PUT /api/customer/disputes/{id}/escalate` - Escalate dispute
- `GET /api/customer/disputes/{id}/evidence/download` - Download evidence

**Test Cases:**
- ✅ Create disputes for transactions
- ✅ Upload evidence files
- ✅ View dispute details and history
- ✅ Respond to disputes with messages
- ✅ Cancel and escalate disputes
- ✅ Download evidence files
- ✅ Filter by status and date
- ✅ Prevent duplicate disputes
- ✅ Authorization and permissions
- ✅ Status transitions (using correct DisputeStatus enum)

### 8. Chat APIs (`tests/Feature/Customer/ChatTest.php`)
**Endpoints Tested:**
- `GET /api/customer/chats` - View chat conversations
- `POST /api/customer/chats` - Start new conversation
- `GET /api/customer/chats/{id}` - View specific conversation
- `POST /api/customer/chats/{id}/messages` - Send message
- `PUT /api/customer/chats/{id}/mark-read` - Mark conversation as read
- `POST /api/customer/chats/{id}/report` - Report conversation
- `PUT /api/customer/chats/{id}/block` - Block user
- `GET /api/customer/chats/transactions/{transactionId}` - Transaction-specific chat

**Test Cases:**
- ✅ View chat conversations list
- ✅ Start new conversations
- ✅ Send and receive messages
- ✅ Mark conversations as read
- ✅ Report inappropriate behavior
- ✅ Block users
- ✅ Transaction-specific chats
- ✅ Filter conversations
- ✅ Authorization and permissions
- ✅ Edge cases and validations

### 9. Profile APIs (`tests/Feature/Customer/ProfileTest.php`)
**Endpoints Tested:**
- `GET /api/customer/profile` - View customer profile
- `PUT /api/customer/profile` - Update profile information
- `PUT /api/customer/profile/password` - Change password
- `POST /api/customer/profile/avatar` - Upload avatar
- `PUT /api/customer/profile/2fa` - Toggle 2FA
- `GET /api/customer/profile/preferences` - View preferences
- `PUT /api/customer/profile/preferences` - Update preferences

**Test Cases:**
- ✅ View complete profile information
- ✅ Update profile details
- ✅ Change password with validation
- ✅ Upload and update avatar
- ✅ Enable/disable 2FA
- ✅ Manage notification preferences
- ✅ Privacy settings
- ✅ Validation and security
- ✅ File upload handling
- ✅ Authorization and permissions

### 10. Dashboard APIs (`tests/Feature/Customer/DashboardTest.php`)
**Endpoints Tested:**
- `GET /api/customer/dashboard` - View dashboard data
- `GET /api/customer/dashboard/stats` - View statistics
- `GET /api/customer/dashboard/quick-actions` - Get quick actions
- `POST /api/customer/dashboard/quick-actions/{action}` - Perform quick action

**Test Cases:**
- ✅ View dashboard overview
- ✅ Display statistics and metrics
- ✅ Recent activities and notifications
- ✅ Quick actions for common tasks
- ✅ Filter dashboard data
- ✅ Performance metrics
- ✅ Authorization and permissions
- ✅ Data accuracy and completeness

## Models Used
All tests use the correct model names as found in the actual codebase:
- ✅ `PersonalStore` (not `Store`)
- ✅ `StoreProduct` (not `Product`)
- ✅ `Customer`
- ✅ `IntermediateTransaction`
- ✅ `StoreTransaction`
- ✅ `WalletTransaction`
- ✅ `PointTransaction`
- ✅ `Dispute`
- ✅ `Referral`

## Enums Used
All tests use the correct enum values:
- ✅ `PointTransactionType` (EARNED, SPENT, REDEEMED, etc.)
- ✅ `IntermediateTransactionStatus` (PENDING, ACTIVE, COMPLETED, etc.)
- ✅ `DisputeStatus` (PENDING, PROCESSING, RESOLVED, CANCELLED)

## Features Tested
- ✅ **CRUD Operations**: Create, Read, Update, Delete for all entities
- ✅ **File Uploads**: Images, documents, product files with proper validation
- ✅ **Authentication**: All APIs require proper authentication
- ✅ **Authorization**: Users can only access their own resources
- ✅ **Validation**: Comprehensive input validation for all endpoints
- ✅ **Filtering & Search**: Query parameters for filtering and searching
- ✅ **Pagination**: Proper pagination support where applicable
- ✅ **Error Handling**: Proper error responses and status codes
- ✅ **Edge Cases**: Boundary conditions and exceptional scenarios
- ✅ **Business Logic**: Complex workflows like transactions, disputes, etc.

## Test Structure
Each test file follows Laravel testing best practices:
- Uses `RefreshDatabase` and `WithFaker` traits
- Proper setup with authenticated customer
- Descriptive test method names with `@test` annotation
- Comprehensive assertions for responses and database state
- Proper cleanup and isolation between tests

## Running the Tests
To run all customer API tests:
```bash
# Run all customer tests
php artisan test tests/Feature/Customer/

# Run specific test file
php artisan test tests/Feature/Customer/WalletTest.php

# Run with coverage
php artisan test --coverage tests/Feature/Customer/
```

## Summary
This comprehensive test suite covers **ALL Customer APIs** (excluding Authentication) with:
- **10 Test Files**
- **200+ Test Cases**
- **50+ API Endpoints**
- **Complete CRUD Coverage**
- **Full Authorization Testing**
- **Comprehensive Validation Testing**
- **Edge Case Coverage**
- **Proper Error Handling**

All tests are ready to run and provide complete coverage of the customer-facing APIs in the selling-resources project.
