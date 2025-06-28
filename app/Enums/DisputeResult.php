<?php

namespace App\Enums;

enum DisputeResult: string
{
    case BUYER_FAVOR = 'buyer_favor';
    case SELLER_FAVOR = 'seller_favor';
    case PARTIAL_REFUND = 'partial_refund';
    case NO_ACTION = 'no_action';

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
            self::BUYER_FAVOR => 'Thiên về người mua',
            self::SELLER_FAVOR => 'Thiên về người bán',
            self::PARTIAL_REFUND => 'Hoàn tiền một phần',
            self::NO_ACTION => 'Không hành động',
        };
    }

    /**
     * Get the color for result badge
     * 
     * Lấy màu cho badge kết quả
     * 
     * @return string
     */
    public function getColor(): string
    {
        return match ($this) {
            self::BUYER_FAVOR => 'success',
            self::SELLER_FAVOR => 'danger',
            self::PARTIAL_REFUND => 'warning',
            self::NO_ACTION => 'gray',
        };
    }

    /**
     * Get the description for the result
     * 
     * Lấy mô tả cho kết quả
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return match ($this) {
            self::BUYER_FAVOR => 'Hoàn tiền toàn bộ cho người mua',
            self::SELLER_FAVOR => 'Chuyển tiền cho người bán',
            self::PARTIAL_REFUND => 'Hoàn tiền một phần cho người mua, phần còn lại cho người bán',
            self::NO_ACTION => 'Không thực hiện hành động nào, giữ nguyên trạng thái',
        };
    }

    /**
     * Check if this result involves refund
     * 
     * Kiểm tra xem kết quả này có liên quan đến hoàn tiền hay không
     * 
     * @return bool
     */
    public function involvesRefund(): bool
    {
        return in_array($this, [self::BUYER_FAVOR, self::PARTIAL_REFUND]);
    }

    /**
     * Check if this result involves payment to seller
     * 
     * Kiểm tra xem kết quả này có liên quan đến thanh toán cho người bán hay không
     * 
     * @return bool
     */
    public function involvesPayment(): bool
    {
        return in_array($this, [self::SELLER_FAVOR, self::PARTIAL_REFUND]);
    }

    /**
     * Check if this result requires no financial action
     * 
     * Kiểm tra xem kết quả này có yêu cầu hành động tài chính hay không
     * 
     * @return bool
     */
    public function requiresNoAction(): bool
    {
        return $this === self::NO_ACTION;
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
