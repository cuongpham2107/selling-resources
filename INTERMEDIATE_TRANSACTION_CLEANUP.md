# INTERMEDIATE TRANSACTION CLEANUP

## Tổng quan
Đã loại bỏ các trường không cần thiết khỏi model `IntermediateTransaction` vì chúng thuộc về logic của `WalletTransaction`.

## Các trường đã xóa:
1. **`customer_id`** - Không cần vì giao dịch trung gian luôn có `buyer_id` và `seller_id` rõ ràng
2. **`type`** - Không cần vì giao dịch trung gian chỉ có 1 loại duy nhất
3. **`payment_method`** - Đã được xử lý trong WalletTransaction
4. **`withdrawal_info`** - Đã được xử lý trong WalletTransaction  
5. **`recipient_id`** - Không cần vì đã có `seller_id`
6. **`sender_id`** - Không cần vì đã có `buyer_id`

## Lý do:
- **Giao dịch trung gian** có mục đích duy nhất: tạo giao dịch mua/bán giữa 2 người với hệ thống giữ tiền
- **WalletTransaction** chuyên xử lý các loại giao dịch ví (nạp, rút, chuyển)
- Tránh **duplicate logic** và **confusion** trong code

## Files đã cập nhật:
- `app/Models/IntermediateTransaction.php` - Xóa các trường và relationships không cần thiết
- `app/Http/Controllers/Customer/ChatController.php` - Cập nhật logic kiểm tra participant
- `resources/js/types/index.d.ts` - Cập nhật TypeScript interface
- `database/migrations/2025_06_29_072430_remove_wallet_fields_from_intermediate_transactions_table.php` - Migration xóa các trường

## Cấu trúc bảng hiện tại:
```
intermediate_transactions:
- id
- transaction_code
- buyer_id (NOT NULL)
- seller_id (NOT NULL)  
- description
- amount
- fee
- duration_hours (NOT NULL)
- status
- buyer_notes
- seller_notes
- admin_notes
- confirmed_at
- seller_sent_at
- buyer_received_at
- expires_at (NOT NULL)
- completed_at
- created_at
- updated_at
```

## Kết quả:
✅ Model đã được làm sạch và chỉ tập trung vào logic giao dịch trung gian
✅ Tránh conflict với WalletTransaction model
✅ Code dễ hiểu và bảo trì hơn
✅ Database schema rõ ràng và nhất quán
