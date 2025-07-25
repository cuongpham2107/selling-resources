<?php

namespace App\Enums;

enum PointTransactionType: string
{
    case ABOUT_CUSTOMER = 'about_customer';
    case STORE_TRANSACTIONS = 'store_transactions';
    case INTERMEDIATE_TRANSACTIONS = 'intermediate_transactions';

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
            self::ABOUT_CUSTOMER => 'Giới thiệu',
            self::STORE_TRANSACTIONS => 'Mua hàng',
            self::INTERMEDIATE_TRANSACTIONS => 'Giao dịch',
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
           self::ABOUT_CUSTOMER => 'Giới thiệu khách hàng',
           self::STORE_TRANSACTIONS => 'Mua hàng từ cửa hàng trên chợ',
           self::INTERMEDIATE_TRANSACTIONS => 'Giao dịch trung gian',
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
            self::ABOUT_CUSTOMER,
            self::STORE_TRANSACTIONS,
            self::INTERMEDIATE_TRANSACTIONS,
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
           self::ABOUT_CUSTOMER,
           self::STORE_TRANSACTIONS,
           self::INTERMEDIATE_TRANSACTIONS,
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
