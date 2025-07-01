# Email Verification Implementation

## Tổng quan
Đã implement tính năng xác thực email cho customer registration. Sau khi đăng ký, customer phải xác thực email trước khi có thể đăng nhập và sử dụng hệ thống.

## Luồng hoạt động

### 1. Đăng ký tài khoản
- Customer điền form đăng ký tại `/register`
- Hệ thống tạo tài khoản với `is_active = false` và `email_verified_at = null`
- Gửi email xác thực tới địa chỉ email của customer
- Chuyển hướng tới trang thông báo xác thực email (`/email/verify`)

### 2. Xác thực email
- Customer nhận email với link xác thực
- Click vào link xác thực (`/email/verify/{id}/{hash}`)
- Hệ thống:
  - Xác thực tính hợp lệ của link
  - Đánh dấu email đã được xác thực (`email_verified_at`)
  - Kích hoạt tài khoản (`is_active = true`)
  - Tự động đăng nhập customer
  - Chuyển hướng tới dashboard

### 3. Đăng nhập
- Customer chỉ có thể đăng nhập sau khi:
  - Tài khoản được kích hoạt (`is_active = true`)
  - Email đã được xác thực (`email_verified_at` không null)
- Nếu chưa xác thực email, hiển thị thông báo lỗi với link để gửi lại email

## Files đã tạo/chỉnh sửa

### 1. Controllers
- `app/Http/Controllers/Customer/Auth/EmailVerificationController.php` (mới)
- `app/Http/Controllers/Customer/Auth/RegisteredCustomerController.php` (cập nhật)

### 2. Requests
- `app/Http/Requests/Customer/Auth/EmailVerificationRequest.php` (mới)
- `app/Http/Requests/Customer/Auth/LoginRequest.php` (cập nhật)

### 3. Middleware
- `app/Http/Middleware/EnsureCustomerEmailIsVerified.php` (mới)

### 4. Models
- `app/Models/Customer.php` (cập nhật - implement MustVerifyEmail)

### 5. Notifications
- `app/Notifications/Customer/VerifyEmailNotification.php` (mới)

### 6. Views
- `resources/js/pages/customer/auth/VerifyEmail.tsx` (mới)
- `resources/js/pages/customer/Login.tsx` (cập nhật)
- `resources/js/pages/customer/Register.tsx` (cập nhật)

### 7. Routes
- `routes/customer.php` (cập nhật)

### 8. Bootstrap
- `bootstrap/app.php` (thêm middleware alias)

## Routes mới

```php
// Email verification routes
GET     /email/verify                     customer.verification.notice
GET     /email/verify/{id}/{hash}         customer.verification.verify
POST    /email/verification-notification  customer.verification.send
```

## Middleware

### customer.verified
Middleware `EnsureCustomerEmailIsVerified` đã được áp dụng cho tất cả customer routes yêu cầu authentication. Middleware này kiểm tra:
- Customer đã đăng nhập
- Email đã được xác thực

## Cấu hình Email

Đảm bảo cấu hình email trong `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=your-smtp-host
MAIL_PORT=587
MAIL_USERNAME=your-email
MAIL_PASSWORD=your-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME="${APP_NAME}"
```

## Testing

### Test đăng ký:
1. Truy cập `/register`
2. Điền thông tin và submit
3. Kiểm tra được chuyển tới `/email/verify`
4. Kiểm tra email được gửi (nếu dùng `log` driver, check `storage/logs/laravel.log`)

### Test xác thực email:
1. Copy link từ email
2. Paste vào browser
3. Kiểm tra được chuyển tới dashboard và tự động đăng nhập

### Test đăng nhập:
1. Thử đăng nhập trước khi xác thực email - phải báo lỗi
2. Sau khi xác thực email - đăng nhập thành công

## Lưu ý

1. **Link xác thực có thời hạn**: Laravel mặc định là 60 phút
2. **Rate limiting**: Gửi lại email bị giới hạn 6 lần/phút
3. **Security**: Link xác thực được ký số (signed) để đảm bảo an toàn
4. **Session**: Email được lưu trong session để có thể resend khi chưa đăng nhập

## Customization

### Thay đổi email template:
Chỉnh sửa `app/Notifications/Customer/VerifyEmailNotification.php`

### Thay đổi thời gian hết hạn:
Trong `config/auth.php`:
```php
'verification' => [
    'expire' => 60, // phút
],
```

### Thay đổi UI:
Chỉnh sửa `resources/js/pages/customer/auth/VerifyEmail.tsx`



network báo
Request URL
http://localhost:8000/customer/profile/two-factor-recovery-codes
Request Method
GET
Status Code
200 OK
Remote Address
127.0.0.1:8000
response {"recovery_codes":"mr8Nbfv67W-qRWi4gpYZD"}

nhưng pupop hiển thị Mã khôi phục
Lưu trữ các mã này ở nơi an toàn. Mỗi mã chỉ có thể sử dụng một lần.

Không thể tải mã khôi phục. Vui lòng thử lại.