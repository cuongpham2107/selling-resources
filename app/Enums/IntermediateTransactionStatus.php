<?php

namespace App\Enums;

enum IntermediateTransactionStatus: string
{
    case PENDING = 'pending';
    case CONFIRMED = 'confirmed';
    case SELLER_SENT = 'seller_sent';
    case BUYER_RECEIVED = 'buyer_received';
    case COMPLETED = 'completed';
    case DISPUTED = 'disputed';
    case CANCELLED = 'cancelled';
    case EXPIRED = 'expired';

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
            self::PENDING => 'Chờ xác nhận',
            self::CONFIRMED => 'Đã xác nhận',
            self::SELLER_SENT => 'Người bán đã gửi',
            self::BUYER_RECEIVED => 'Người mua đã nhận',
            self::COMPLETED => 'Hoàn thành',
            self::DISPUTED => 'Tranh chấp',
            self::CANCELLED => 'Đã hủy',
            self::EXPIRED => 'Đã hết hạn',
        };
    }

    /**
     * Get the color for status badge
     * 
     * Lấy màu cho badge trạng thái
     * 
     * @return string
     */
    public function getColor(): string
    {
        return match ($this) {
            self::PENDING => 'warning',
            self::CONFIRMED => 'primary',
            self::SELLER_SENT => 'info',
            self::BUYER_RECEIVED => 'info',
            self::COMPLETED => 'success',
            self::DISPUTED => 'danger',
            self::CANCELLED => 'danger',
            self::EXPIRED => 'secondary',
        };
    }

    /**
     * Get possible next states for state machine
     * 
     * Lấy các trạng thái có thể chuyển tiếp cho state machine
     * 
     * @return array
     */
    public function getNextStates(): array
    {
        return match ($this) {
            self::PENDING => [self::CONFIRMED, self::CANCELLED, self::EXPIRED],
            self::CONFIRMED => [self::SELLER_SENT, self::DISPUTED, self::CANCELLED],
            self::SELLER_SENT => [self::BUYER_RECEIVED, self::DISPUTED, self::CANCELLED],
            self::BUYER_RECEIVED => [self::COMPLETED, self::DISPUTED],
            self::COMPLETED => [], // Final state
            self::DISPUTED => [self::COMPLETED, self::CANCELLED], // Can be resolved
            self::CANCELLED => [], // Final state
            self::EXPIRED => [], // Final state
        };
    }

    /**
     * Check if this is a final state
     * 
     * Kiểm tra xem đây có phải là trạng thái cuối cùng hay không
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return in_array($this, [self::COMPLETED, self::CANCELLED, self::EXPIRED]);
    }

    /**
     * Check if transaction can be cancelled
     * 
     * Kiểm tra xem giao dịch có thể bị hủy hay không
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return in_array($this, [self::PENDING, self::CONFIRMED]);
    }

    /**
     * Check if transaction can be disputed
     * 
     * Kiểm tra xem giao dịch có thể bị tranh chấp hay không
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return in_array($this, [self::CONFIRMED, self::SELLER_SENT, self::BUYER_RECEIVED]);
    }

    /**
     * Check if transaction is in progress
     * 
     * Kiểm tra xem giao dịch có đang diễn ra hay không
     * 
     * @return bool
     */
    public function isInProgress(): bool
    {
        return in_array($this, [self::PENDING, self::CONFIRMED, self::SELLER_SENT, self::BUYER_RECEIVED]);
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
