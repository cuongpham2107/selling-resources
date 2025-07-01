# Password Reset Implementation

## Tổng quan
Đã implement tính năng quên mật khẩu (forgot password) cho customer. Cho phép customer đặt lại mật khẩu thông qua email.

## Luồng hoạt động

### 1. Yêu cầu đặt lại mật khẩu
- Customer vào trang đăng nhập và click "Quên mật khẩu?"
- Điền email tại `/forgot-password`
- Hệ thống kiểm tra:
  - Email có tồn tại không
  - Tài khoản có được kích hoạt không
- Gửi email chứa link đặt lại mật khẩu
- Hiển thị thông báo thành công

### 2. Đặt lại mật khẩu
- Customer nhận email với link reset password
- Click vào link (có dạng `/reset-password/{token}?email=...`)
- Điền mật khẩu mới tại trang reset
- Hệ thống xác thực token và cập nhật mật khẩu
- Chuyển hướng về trang đăng nhập với thông báo thành công

## Files đã tạo/chỉnh sửa

### 1. Controllers
- `app/Http/Controllers/Customer/Auth/PasswordResetController.php` (mới)

### 2. Notifications
- `app/Notifications/Customer/ResetPasswordNotification.php` (mới)

### 3. Views
- `resources/js/pages/customer/auth/ForgotPassword.tsx` (mới)
- `resources/js/pages/customer/auth/ResetPassword.tsx` (mới)
- `resources/js/pages/customer/Login.tsx` (cập nhật - thêm link "Quên mật khẩu")

### 4. Configuration
- `config/auth.php` (thêm customer password broker)

### 5. Models
- `app/Models/Customer.php` (thêm method sendPasswordResetNotification)

### 6. Routes
- `routes/customer.php` (thêm password reset routes)

### 7. Commands (testing)
- `app/Console/Commands/TestPasswordResetCommand.php` (mới)

## Routes mới

```php
// Password Reset Routes (Guest only)
GET     /forgot-password           customer.password.request
POST    /forgot-password           customer.password.email  
GET     /reset-password/{token}    customer.password.reset
POST    /reset-password            customer.password.update
```

## Configuration

### Password Broker
Đã thêm broker cho customer trong `config/auth.php`:

```php
'passwords' => [
    'users' => [
        'provider' => 'users',
        'table' => 'password_reset_tokens',
        'expire' => 60,
        'throttle' => 60,
    ],
    'customers' => [
        'provider' => 'customers', 
        'table' => 'password_reset_tokens',
        'expire' => 60,
        'throttle' => 60,
    ],
],
```

### Database Table
Sử dụng bảng `password_reset_tokens` có sẵn của Laravel để lưu token reset.

## Security Features

1. **Token expiration**: Token hết hạn sau 60 phút
2. **Rate limiting**: Chỉ cho phép gửi 1 email reset mỗi 60 giây
3. **Account validation**: Kiểm tra tài khoản tồn tại và đã kích hoạt
4. **Token validation**: Xác thực token trước khi cho phép đặt lại mật khẩu
5. **Password requirements**: Tuân thủ quy tắc mật khẩu của Laravel

## Testing

### Test gửi email reset:
```bash
php artisan test:password-reset cuongpham2107@gmail.com
```

### Test UI flow:
1. Truy cập `/login`
2. Click "Quên mật khẩu?"
3. Nhập email và submit
4. Kiểm tra email được gửi
5. Click link trong email
6. Nhập mật khẩu mới
7. Kiểm tra đăng nhập với mật khẩu mới

## Email Template

Email reset password bao gồm:
- Tiêu đề: "Đặt lại mật khẩu tài khoản"
- Chào hỏi với username
- Hướng dẫn rõ ràng bằng tiếng Việt
- Nút "Đặt lại mật khẩu" 
- Cảnh báo về thời hạn (60 phút)
- Lưu ý nếu không yêu cầu

## Error Handling

### Các trường hợp lỗi được xử lý:
- Email không tồn tại
- Tài khoản chưa kích hoạt
- Token không hợp lệ hoặc hết hạn
- Rate limiting (quá nhiều request)
- Mật khẩu không đủ mạnh
- Xác nhận mật khẩu không khớp

### Messages tiếng Việt:
- "Không tìm thấy tài khoản với email này."
- "Tài khoản chưa được kích hoạt. Vui lòng xác thực email trước."
- "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
- "Vui lòng đợi trước khi yêu cầu link mới."

## UI/UX Features

### Trang Forgot Password:
- Form nhập email đơn giản
- Validation realtime
- Loading state
- Success state với hướng dẫn chi tiết
- Link quay lại đăng nhập

### Trang Reset Password:
- Hiển thị email (read-only)
- Form mật khẩu với toggle show/hide
- Validation requirements
- Confirm password field
- Loading state
- Link quay lại đăng nhập

### Responsive Design:
- Mobile-friendly
- Consistent với design system
- Icons và visual cues rõ ràng

## Troubleshooting

### Lỗi "passwords.throttled":
- Đợi 60 giây trước khi gửi email tiếp theo
- Hoặc clear cache: `php artisan cache:clear`

### Email không được gửi:
- Kiểm tra cấu hình SMTP trong `.env`
- Kiểm tra log: `storage/logs/laravel.log`
- Test với command: `php artisan test:email`

### Token invalid:
- Token có thể đã hết hạn (60 phút)
- Yêu cầu gửi lại email reset mới

## Integration với Email Verification

Password reset tích hợp với email verification:
- Chỉ tài khoản đã kích hoạt mới được reset password
- Nếu chưa kích hoạt, hướng dẫn user xác thực email trước

Hệ thống giờ đã có đầy đủ tính năng authentication:
- ✅ Registration với email verification
- ✅ Login với validation
- ✅ Email verification
- ✅ Password reset
- ✅ UI/UX hoàn chỉnh bằng tiếng Việt
