<?php

namespace App\Enums;

enum StoreTransactionStatus: string
{
    case PROCESSING = 'processing';
    case COMPLETED = 'completed';
    case DISPUTED = 'disputed';
    case CANCELLED = 'cancelled';

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
            self::PROCESSING => 'Đang xử lý',
            self::COMPLETED => 'Hoàn thành',
            self::DISPUTED => 'Tranh chấp',
            self::CANCELLED => 'Đã hủy',
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
            self::PROCESSING => 'primary',
            self::COMPLETED => 'success',
            self::DISPUTED => 'danger',
            self::CANCELLED => 'danger',
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
            self::PROCESSING => [self::COMPLETED, self::DISPUTED, self::CANCELLED],
            self::COMPLETED => [], // Final state
            self::DISPUTED => [self::COMPLETED, self::CANCELLED], // Can be resolved
            self::CANCELLED => [], // Final state
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
        return in_array($this, [self::COMPLETED, self::CANCELLED]);
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
        return $this === self::PROCESSING;
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
        return $this === self::PROCESSING;
    }

    /**
     * Check if transaction can be completed
     * 
     * Kiểm tra xem giao dịch có thể hoàn thành hay không
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return $this === self::PROCESSING;
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
        return $this === self::PROCESSING;
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
