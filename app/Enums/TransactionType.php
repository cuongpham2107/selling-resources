<?php

namespace App\Enums;

enum TransactionType: string
{
    case INTERMEDIATE = 'intermediate_transaction';
    case STORE = 'store_transaction';
    case REFERRAL = 'referral';

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
            self::INTERMEDIATE => 'Giao dịch trung gian',
            self::STORE => 'Giao dịch cửa hàng',
            self::REFERRAL => 'Giới thiệu',
        };
    }

    /**
     * Get the icon for transaction type
     * 
     * Lấy icon cho loại giao dịch
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return match ($this) {
            self::INTERMEDIATE => 'heroicon-o-arrow-path',
            self::STORE => 'heroicon-o-building-storefront',
            self::REFERRAL => 'heroicon-o-users',
        };
    }

    /**
     * Get the color for transaction type
     * 
     * Lấy màu cho loại giao dịch
     * 
     * @return string
     */
    public function getColor(): string
    {
        return match ($this) {
            self::INTERMEDIATE => 'info',
            self::STORE => 'warning',
            self::REFERRAL => 'success',
        };
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
