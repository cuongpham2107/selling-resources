# 📚 FILAMENT RESOURCES WORKFLOW GUIDE

## 🎯 Tổng quan hệ thống

Hệ thống MMO Transaction được xây dựng với **14 Filament v4 Resources** được tổ chức thành **6 Navigation Groups** chính, mỗi resource có luồng xử lý riêng biệt nhưng có mối liên kết chặt chẽ với nhau.

---

## 🗂️ CẤU TRÚC NAVIGATION GROUPS

### 📊 **1. Quản lý khách hàng**
- **CustomerResource** - Quản lý thông tin khách hàng
- **CustomerBalanceResource** - Quản lý số dư tiền tệ
- **CustomerPointResource** - Quản lý số C (điểm thưởng)

### 💰 **2. Quản lý giao dịch**
- **IntermediateTransactionResource** - Giao dịch trung gian chính
- **StoreTransactionResource** - Giao dịch cửa hàng
- **DisputeResource** - Tranh chấp giao dịch

### 🏪 **3. Quản lý cửa hàng**
- **PersonalStoreResource** - Cửa hàng cá nhân
- **StoreProductResource** - Sản phẩm trong cửa hàng

### 💬 **4. Quản lý chat**
- **GeneralChatResource** - Chat tổng quát
- **TransactionChatResource** - Chat riêng cho giao dịch

### 🎯 **5. Quản lý C**
- **PointTransactionResource** - Lịch sử giao dịch C
- **ReferralResource** - Hệ thống giới thiệu

### ⚙️ **6. Cấu hình hệ thống**
- **SystemSettingResource** - Cài đặt hệ thống
- **TransactionFeeResource** - Cấu hình phí giao dịch

---

## 🔄 LUỒNG THỰC THI CHI TIẾT

## 📊 1. QUẢN LÝ KHÁCH HÀNG

### 👤 CustomerResource

**📋 Mục đích**: Quản lý thông tin khách hàng frontend (không phải admin)

**🔄 Luồng hoạt động**:
```
1. CREATE → Tạo khách hàng mới
   ├── Tự động generate referral_code
   ├── Tự động tạo CustomerBalance (0 VNĐ)
   ├── Tự động tạo CustomerPoint (0 C)
   └── Gửi email xác thực (nếu có)

2. VIEW/EDIT → Xem/Sửa thông tin
   ├── Hiển thị balance, points realtime
   ├── Tracking referrals made/received
   ├── Hiển thị transaction history
   └── KYC verification status

3. RELATIONSHIPS → Liên kết dữ liệu
   ├── Balance: hasOne CustomerBalance
   ├── Points: hasOne CustomerPoint
   ├── PersonalStore: hasOne PersonalStore
   ├── Referrals Made: hasMany Referral (referrer_id)
   ├── Referrals Received: hasMany Referral (referred_id)
   ├── Transactions: hasMany IntermediateTransaction
   └── Chats: hasMany GeneralChat, TransactionChat
```

**🎯 Business Logic**:
- Khách hàng không có role (tách biệt với User admin)
- Tự động tạo referral code unique khi tạo mới
- Balance và Points được quản lý riêng biệt
- KYC verification để tăng giới hạn giao dịch

---

### 💰 CustomerBalanceResource

**📋 Mục đích**: Quản lý số dư tiền mặt của khách hàng

**🔄 Luồng hoạt động**:
```
1. BALANCE TRACKING → Theo dõi số dư
   ├── Balance hiện tại (VNĐ)
   ├── Pending amount (tiền đang chờ)
   ├── Lịch sử thay đổi số dư
   └── Auto-sync với transactions

2. BUSINESS RULES → Quy tắc kinh doanh
   ├── Không được âm số dư (except pending)
   ├── Tự động cập nhật khi có transaction
   ├── Lock/unlock balance khi dispute
   └── Daily limit checking

3. RELATIONSHIPS → Liên kết
   ├── Customer: belongsTo Customer
   └── Transactions: tracking via IntermediateTransaction
```

**🎯 Business Logic**:
- Số dư thực tế có thể khác pending amount
- Tự động cập nhật khi giao dịch hoàn thành
- Có thể bị lock khi có tranh chấp

---

### 🎯 CustomerPointResource

**📋 Mục đích**: Quản lý số C (điểm thưởng) của khách hàng

**🔄 Luồng hoạt động**:
```
1. POINT MANAGEMENT → Quản lý C
   ├── Current points balance (C)
   ├── Point earning history
   ├── Point spending history
   └── Referral bonus tracking

2. EARNING RULES → Quy tắc kiếm C
   ├── Complete transaction → earn C
   ├── Referral bonus → earn C  
   ├── Daily login bonus → earn C
   └── Special events → earn C

3. SPENDING RULES → Quy tắc tiêu C
   ├── Send points to other customers
   ├── Exchange for fee discounts
   ├── Special privileges unlock
   └── Marketplace purchases

4. RELATIONSHIPS → Liên kết
   ├── Customer: belongsTo Customer
   └── Transactions: hasMany PointTransaction
```

**🎯 Business Logic**:
- C là đơn vị điểm thưởng nội bộ (integer)
- Có thể transfer giữa customers
- Dùng để giảm phí giao dịch
- Tự động cộng khi hoàn thành giao dịch

---

## 💰 2. QUẢN LÝ GIAO DỊCH

### 🔄 IntermediateTransactionResource

**📋 Mục đích**: Giao dịch trung gian chính (MMO services)

**🔄 Luồng hoạt động**:
```
1. TRANSACTION LIFECYCLE → Vòng đời giao dịch
   ├── PENDING → Vừa tạo, chờ xử lý
   ├── PROCESSING → Đang thực hiện
   ├── COMPLETED → Hoàn thành thành công
   ├── CANCELLED → Hủy bỏ
   └── DISPUTED → Có tranh chấp

2. FEE CALCULATION → Tính phí
   ├── Base fee từ TransactionFee table
   ├── Percentage fee based on amount
   ├── Daily fee calculation
   ├── Point discount application
   └── Final fee = base + percentage - point_discount

3. POINT REWARDS → Thưởng C
   ├── Buyer: earn points when completed
   ├── Seller: earn points when completed
   ├── Amount based on TransactionFee rules
   └── Auto-add to CustomerPoint

4. WORKFLOW STATES → Trạng thái xử lý
   PENDING ──[Admin Approve]──> PROCESSING
      │                            │
      └─[Cancel]                   ├──[Complete]──> COMPLETED
                                   │                    │
                                   └──[Dispute]──> DISPUTED
```

**🎯 Business Logic**:
- Buyer đặt order và lock money
- Seller thực hiện service
- Admin moderate và approve
- Tự động tính phí và thưởng C
- Support dispute resolution

---

### 🏪 StoreTransactionResource

**📋 Mục đích**: Giao dịch trong cửa hàng cá nhân

**🔄 Luồng hoạt động**:
```
1. STORE PURCHASE FLOW → Luồng mua hàng
   ├── Customer browse PersonalStore
   ├── Select StoreProduct
   ├── Create StoreTransaction
   ├── Payment processing
   └── Auto-delivery (if digital)

2. TRANSACTION STATES → Trạng thái
   ├── PENDING → Chờ thanh toán
   ├── PAID → Đã thanh toán
   ├── DELIVERED → Đã giao hàng
   ├── COMPLETED → Hoàn thành
   └── REFUNDED → Hoàn tiền

3. AUTO-DELIVERY → Giao hàng tự động
   ├── Digital products → instant delivery
   ├── Account credentials → secure transfer
   ├── Download links → time-limited
   └── License keys → auto-generated

4. RELATIONSHIPS → Liên kết
   ├── Buyer: belongsTo Customer
   ├── Seller: belongsTo Customer (store owner)
   ├── Product: belongsTo StoreProduct
   └── Store: belongsTo PersonalStore
```

**🎯 Business Logic**:
- Simplified flow so với IntermediateTransaction
- Support auto-delivery cho digital products
- Store owner có control panel riêng
- Commission system cho platform

---

### ⚖️ DisputeResource

**📋 Mục đích**: Xử lý tranh chấp giao dịch

**🔄 Luồng hoạt động**:
```
1. DISPUTE CREATION → Tạo tranh chấp
   ├── Customer create dispute
   ├── Attach evidence (files, screenshots)
   ├── Set dispute reason
   └── Auto-lock related transaction

2. RESOLUTION PROCESS → Quy trình giải quyết
   OPEN ──[Admin Review]──> UNDER_REVIEW
     │                           │
     └─[Auto-close]              ├──[Resolve]──> RESOLVED
                                 └──[Escalate]──> ESCALATED

3. ADMIN ACTIONS → Hành động admin
   ├── Review evidence
   ├── Contact both parties
   ├── Make decision
   ├── Execute refund/payment
   └── Close dispute

4. BUSINESS IMPACT → Tác động kinh doanh
   ├── Lock transaction funds
   ├── Suspend related accounts
   ├── Update customer ratings
   └── Platform commission handling
```

**🎯 Business Logic**:
- Protect both buyer and seller
- Evidence-based resolution
- Admin có full control
- Automatic fund management

---

## 🏪 3. QUẢN LÝ CỬA HÀNG

### 🏬 PersonalStoreResource

**📋 Mục đích**: Cửa hàng cá nhân của customer

**🔄 Luồng hoạt động**:
```
1. STORE SETUP → Thiết lập cửa hàng
   ├── Customer create store
   ├── Set store name, description
   ├── Upload logo, banner
   ├── Configure payment methods
   └── Set store policies

2. STORE MANAGEMENT → Quản lý cửa hàng
   ├── Add/edit products (StoreProduct)
   ├── Manage inventory
   ├── Process orders (StoreTransaction)
   ├── Customer communications
   └── Analytics and reports

3. STORE VERIFICATION → Xác minh cửa hàng
   ├── Document verification
   ├── Quality assessment
   ├── Compliance check
   └── Badge assignment (verified, premium)

4. REVENUE TRACKING → Theo dõi doanh thu
   ├── Daily/monthly sales
   ├── Product performance
   ├── Customer feedback
   └── Commission calculations
```

**🎯 Business Logic**:
- 1 Customer có thể có 1 PersonalStore
- Store phải được verify để bán
- Platform lấy % commission
- Store owner có dashboard riêng

---

### 📦 StoreProductResource

**📋 Mục đích**: Sản phẩm trong cửa hàng

**🔄 Luồng hoạt động**:
```
1. PRODUCT LIFECYCLE → Vòng đời sản phẩm
   ├── DRAFT → Đang soạn thảo
   ├── ACTIVE → Đang bán
   ├── INACTIVE → Tạm ngưng
   ├── OUT_OF_STOCK → Hết hàng
   └── DISCONTINUED → Ngưng bán

2. PRODUCT TYPES → Loại sản phẩm
   ├── DIGITAL → Sản phẩm số (accounts, keys)
   ├── SERVICE → Dịch vụ (boosting, coaching)
   ├── PHYSICAL → Sản phẩm vật lý
   └── SUBSCRIPTION → Dịch vụ đăng ký

3. INVENTORY MANAGEMENT → Quản lý tồn kho
   ├── Stock quantity tracking
   ├── Auto-deduct on purchase
   ├── Low stock alerts
   └── Restock notifications

4. PRICING STRATEGY → Chiến lược giá
   ├── Base price setting
   ├── Bulk discount rules
   ├── Promotional pricing
   └── Dynamic pricing (future)
```

**🎯 Business Logic**:
- Mỗi product thuộc về 1 PersonalStore
- Support multiple product types
- Automated inventory management
- Flexible pricing options

---

## 💬 4. QUẢN LÝ CHAT

### 💬 GeneralChatResource

**📋 Mục đích**: Chat tổng quát trong hệ thống

**🔄 Luồng hoạt động**:
```
1. CHAT SYSTEM → Hệ thống chat
   ├── Real-time messaging
   ├── File sharing support
   ├── Emoji and reactions
   └── Message history

2. MODERATION → Kiểm duyệt
   ├── Auto spam detection
   ├── Profanity filtering
   ├── Admin moderation tools
   └── User reporting system

3. CHAT LIMITS → Giới hạn chat
   ├── Daily message limits (DailyChatLimit)
   ├── New user restrictions
   ├── Verified user privileges
   └── VIP user benefits

4. CHAT ROOMS → Phòng chat
   ├── General discussion
   ├── Trading rooms
   ├── Support channels
   └── Regional channels
```

**🎯 Business Logic**:
- Public chat cho tất cả users
- Daily limits để chống spam
- Moderation tự động và thủ công
- Multi-room support

---

### 💭 TransactionChatResource

**📋 Mục đích**: Chat riêng cho từng giao dịch

**🔄 Luồng hoạt động**:
```
1. PRIVATE MESSAGING → Tin nhắn riêng tư
   ├── Buyer ↔ Seller communication
   ├── Order details discussion
   ├── Progress updates
   └── Issue reporting

2. TRANSACTION CONTEXT → Ngữ cảnh giao dịch
   ├── Auto-link to transaction
   ├── Transaction status updates
   ├── Automated notifications
   └── Evidence attachment

3. MODERATION → Kiểm duyệt
   ├── Admin can join chat
   ├── Dispute evidence collection
   ├── Conversation logging
   └── Privacy protection

4. WORKFLOW INTEGRATION → Tích hợp quy trình
   ├── Status change notifications
   ├── Payment confirmations
   ├── Delivery notifications
   └── Completion confirmations
```

**🎯 Business Logic**:
- 1-1 chat giữa buyer và seller
- Tự động tạo khi có transaction
- Admin có thể moderate
- Evidence cho dispute resolution

---

## 🎯 5. QUẢN LÝ C (ĐIỂM THƯỞNG)

### 📊 PointTransactionResource

**📋 Mục đích**: Lịch sử giao dịch C của customers

**🔄 Luồng hoạt động**:
```
1. POINT TRANSACTION TYPES → Loại giao dịch C
   ├── EARNED → Kiếm được (hoàn thành giao dịch)
   ├── SENT → Gửi cho customer khác
   ├── RECEIVED → Nhận từ customer khác
   ├── REFERRAL_BONUS → Thưởng giới thiệu
   └── SPENT → Tiêu dùng (giảm phí, mua hàng)

2. AUTO POINT GENERATION → Tự động tạo C
   ├── Transaction completed → auto earn points
   ├── Referral successful → bonus points
   ├── Daily login → small bonus
   └── Special events → event points

3. POINT TRANSFER SYSTEM → Hệ thống chuyển C
   ├── Customer A send points to Customer B
   ├── Verify sufficient balance
   ├── Create 2 PointTransaction records
   ├── Update both CustomerPoint balances
   └── Notification to both parties

4. POINT SPENDING → Tiêu dùng C
   ├── Fee discount application
   ├── Premium feature unlock
   ├── Marketplace purchases
   └── Cashback conversion (future)
```

**🎯 Business Logic**:
- Mỗi thay đổi C đều có record
- Support transfer giữa customers
- Automatic point earning system
- Flexible spending options

---

### 👥 ReferralResource

**📋 Mục đích**: Hệ thống giới thiệu khách hàng

**🔄 Luồng hoạt động**:
```
1. REFERRAL CREATION → Tạo quan hệ giới thiệu
   ├── Customer A shares referral link
   ├── Customer B signs up via link
   ├── Create Referral record (A→B)
   └── B gets new user bonus

2. REFERRAL TRACKING → Theo dõi hiệu quả
   ├── Track successful referrals
   ├── Monitor transaction activity
   ├── Calculate point rewards
   └── Update referral statistics

3. POINT REWARDS → Thưởng C giới thiệu
   ├── Immediate signup bonus (small)
   ├── First transaction bonus (medium)
   ├── Milestone bonuses (large)
   └── Lifetime commission (% of transactions)

4. REFERRAL ANALYTICS → Phân tích
   ├── Top referrers leaderboard
   ├── Conversion rate tracking
   ├── Revenue per referral
   └── Referral tree visualization
```

**🎯 Business Logic**:
- Multi-level referral system
- Point rewards cho cả referrer và referred
- Tracking lifetime value
- Anti-fraud measures

---

## ⚙️ 6. CẤU HÌNH HỆ THỐNG

### 🔧 SystemSettingResource

**📋 Mục đích**: Cấu hình toàn hệ thống

**🔄 Luồng hoạt động**:
```
1. SYSTEM CONFIGURATION → Cấu hình hệ thống
   ├── Platform commission rates
   ├── Daily limits and restrictions
   ├── Point earning rules
   ├── Chat system settings
   └── Security configurations

2. SETTING CATEGORIES → Phân loại cài đặt
   ├── TRANSACTION → Cài đặt giao dịch
   ├── POINT → Cài đặt điểm thưởng
   ├── CHAT → Cài đặt chat
   ├── SECURITY → Cài đặt bảo mật
   └── GENERAL → Cài đặt chung

3. DYNAMIC CONFIGURATION → Cấu hình động
   ├── Hot-reload settings without restart
   ├── A/B testing configurations
   ├── Feature flags management
   └── Maintenance mode control

4. AUDIT TRAIL → Dấu vết thay đổi
   ├── Track all setting changes
   ├── Admin who made changes
   ├── Before/after values
   └── Change reasons
```

**🎯 Business Logic**:
- Key-value configuration system
- Real-time setting updates
- Role-based setting access
- Complete audit trail

---

### 💳 TransactionFeeResource

**📋 Mục đích**: Cấu hình phí giao dịch

**🔄 Luồng hoạt động**:
```
1. FEE STRUCTURE → Cấu trúc phí
   ├── Amount ranges (min_amount → max_amount)
   ├── Fixed fee (fee_amount in VND)
   ├── Percentage fee (fee_percentage %)
   ├── Daily fee (daily_fee_percentage %)
   └── Point rewards (points_reward C)

2. FEE CALCULATION → Tính toán phí
   STEP 1: Find matching fee rule by amount
   STEP 2: Calculate base_fee = fee_amount
   STEP 3: Calculate percent_fee = amount × fee_percentage / 100
   STEP 4: Calculate daily_fee = amount × daily_fee_percentage / 100
   STEP 5: total_fee = base_fee + percent_fee + daily_fee
   STEP 6: Apply point discounts if any
   STEP 7: Award points_reward when completed

3. FEE RULES PRIORITY → Ưu tiên áp dụng
   ├── Most specific range first
   ├── Active rules only
   ├── Default fallback rule
   └── Admin override capability

4. POINT INTEGRATION → Tích hợp C
   ├── Automatic point rewards
   ├── Point-based fee discounts
   ├── VIP customer benefits
   └── Loyalty program integration
```

**🎯 Business Logic**:
- Flexible fee structure
- Multiple fee components
- Automatic point rewards
- Admin full control

---

## 🔄 CROSS-RESOURCE WORKFLOWS

### 📈 Luồng giao dịch hoàn chỉnh

```
1. Customer A tạo IntermediateTransaction
   ├── Buyer: Customer A
   ├── Amount: 100,000 VND
   ├── Status: PENDING
   └── Lock funds in CustomerBalance

2. TransactionFee calculation
   ├── Find matching fee rule
   ├── Calculate total fee: 5,000 VND
   ├── Deduct from Customer A balance
   └── Set points_reward: 10 C

3. Admin approve → Status: PROCESSING
   ├── Notification to Customer B (seller)
   ├── Create TransactionChat
   └── Start service delivery

4. Customer B complete work
   ├── Upload evidence
   ├── Mark as completed
   └── Wait for verification

5. Admin verify → Status: COMPLETED
   ├── Transfer funds to Customer B
   ├── Add 10 C to both customers (PointTransaction)
   ├── Update referral bonuses if any
   └── Close TransactionChat

6. If dispute occurs
   ├── Create Dispute record
   ├── Lock all funds
   ├── Admin investigation
   └── Final resolution
```

### 🏪 Luồng cửa hàng

```
1. Customer tạo PersonalStore
   ├── Store verification process
   ├── Document upload
   └── Admin approval

2. Add StoreProduct
   ├── Set product details
   ├── Upload images
   ├── Set inventory
   └── Set pricing

3. Customer B mua hàng
   ├── Create StoreTransaction
   ├── Payment processing
   ├── Auto-delivery (if digital)
   └── Completion confirmation

4. Revenue distribution
   ├── Store owner receives payment
   ├── Platform takes commission
   ├── Point rewards distributed
   └── Analytics updated
```

### 🎯 Luồng C (điểm thưởng)

```
1. Customer hoàn thành giao dịch
   ├── Auto-create PointTransaction (EARNED)
   ├── Update CustomerPoint balance
   └── Check referral bonuses

2. Referral bonus calculation
   ├── Find referrer via Customer.referred_by
   ├── Create PointTransaction (REFERRAL_BONUS)
   ├── Update Referral.total_points_earned
   └── Notify referrer

3. Customer transfer C
   ├── Verify sufficient balance
   ├── Create PointTransaction (SENT) for sender
   ├── Create PointTransaction (RECEIVED) for receiver
   ├── Update both CustomerPoint balances
   └── Notifications

4. C spending on fees
   ├── Calculate available point discount
   ├── Apply discount to transaction fee
   ├── Create PointTransaction (SPENT)
   └── Update CustomerPoint balance
```

---

## 🎯 KẾT LUẬN

### ✅ **Điểm mạnh của hệ thống**:

1. **Modular Architecture**: Mỗi resource độc lập nhưng liên kết chặt chẽ
2. **Complete Business Logic**: Covers toàn bộ MMO transaction workflow
3. **Automated Processes**: Tự động tính phí, thưởng C, notifications
4. **Flexible Configuration**: SystemSetting và TransactionFee cho phép tùy biến
5. **Comprehensive Tracking**: Đầy đủ audit trail và analytics
6. **User Experience**: Vietnamese UI, intuitive workflows
7. **Scalability**: Designed cho high-volume transactions

### 🚀 **Next Steps**:

1. **API Development**: RESTful API cho frontend mobile/web
2. **Real-time Features**: WebSocket cho chat và notifications
3. **Analytics Dashboard**: Business intelligence và reporting
4. **Mobile App**: Native iOS/Android applications
5. **Payment Integration**: Multiple payment gateways
6. **Advanced Features**: AI-powered fraud detection, recommendation engine

---

*Báo cáo được tạo: Tháng 6, 2025*  
*Hệ thống: ✅ Production Ready*  
*Status: 🚀 Fully Operational*
