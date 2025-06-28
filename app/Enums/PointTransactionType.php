<?php

namespace App\Enums;

enum PointTransactionType: string
{
    case EARNED = 'earned';
    case EARN = 'earn';
    case REFERRAL_BONUS = 'referral_bonus';
    case SENT = 'sent';
    case RECEIVED = 'received';
    case EXCHANGED = 'exchanged';
    case SPEND = 'spend';
    case TRANSFER = 'transfer';
    case ADMIN_ADJUST = 'admin_adjust';

    /**
     * Get Vietnamese label for the enum value
     * 
     * Lấy nhãn tiếng Việt cho giá trị enum
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return match ($this) {
            self::EARNED, self::EARN => 'Kiếm được',
            self::REFERRAL_BONUS => 'Thưởng giới thiệu',
            self::SENT => 'Gửi đi', 
            self::RECEIVED => 'Nhận được',
            self::EXCHANGED => 'Đổi điểm',
            self::SPEND => 'Tiêu dùng',
            self::TRANSFER => 'Chuyển khoản',
            self::ADMIN_ADJUST => 'Điều chỉnh admin',
        };
    }

    /**
     * Get the description for the enum value
     * 
     * Lấy mô tả cho giá trị enum
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::EARNED, self::EARN => 'Điểm kiếm được từ hoàn thành giao dịch',
            self::REFERRAL_BONUS => 'Điểm thưởng từ việc giới thiệu bạn bè',
            self::SENT => 'Điểm gửi cho khách hàng khác',
            self::RECEIVED => 'Điểm nhận từ khách hàng khác',
            self::EXCHANGED => 'Điểm đổi thành tiền hoặc ưu đãi',
            self::SPEND => 'Điểm tiêu dùng cho dịch vụ',
            self::TRANSFER => 'Điểm chuyển giữa các tài khoản',
            self::ADMIN_ADJUST => 'Điều chỉnh điểm bởi quản trị viên',
        };
    }

    /**
     * Check if this transaction type increases balance
     * 
     * Kiểm tra xem loại giao dịch này có tăng số dư hay không
     * 
     * @return bool
     */
    public function isIncreasing(): bool
    {
        return in_array($this, [
            self::EARNED, 
            self::EARN, 
            self::REFERRAL_BONUS, 
            self::RECEIVED, 
            self::ADMIN_ADJUST
        ]);
    }

    /**
     * Check if this transaction type decreases balance
     * 
     * Kiểm tra xem loại giao dịch này có giảm số dư hay không
     * 
     * @return bool
     */
    public function isDecreasing(): bool
    {
        return in_array($this, [
            self::SENT, 
            self::EXCHANGED, 
            self::SPEND, 
            self::TRANSFER
        ]);
    }

    /**
     * Get all enum values as array
     * 
     * Lấy tất cả giá trị enum dưới dạng mảng
     * 
     * @return array
     */
    public static function toArray(): array
    {
        return array_column(self::cases(), 'value');
    }

    /**
     * Get all enum values with labels for forms
     * 
     * Lấy tất cả giá trị enum với nhãn cho form
     * 
     * @return array
     */
    public static function getOptions(): array
    {
        $options = [];
        foreach (self::cases() as $case) {
            $options[$case->value] = $case->getLabel();
        }
        return $options;
    }
}
