<?php

namespace App\Enums;

enum DisputeStatus: string
{
    case PENDING = 'pending';
    case PROCESSING = 'processing';
    case RESOLVED = 'resolved';
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
            self::PENDING => 'Đang chờ',
            self::PROCESSING => 'Đang xử lý',
            self::RESOLVED => 'Đã giải quyết',
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
            self::PENDING => 'warning',
            self::PROCESSING => 'info',
            self::RESOLVED => 'success',
            self::CANCELLED => 'gray',
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
            self::PENDING => [self::PROCESSING, self::CANCELLED],
            self::PROCESSING => [self::RESOLVED, self::CANCELLED],
            self::RESOLVED => [], // Final state
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
        return in_array($this, [self::RESOLVED, self::CANCELLED]);
    }

    /**
     * Check if dispute can be assigned
     * 
     * Kiểm tra xem tranh chấp có thể được phân công hay không
     * 
     * @return bool
     */
    public function canBeAssigned(): bool
    {
        return $this === self::PENDING;
    }

    /**
     * Check if dispute can be resolved
     * 
     * Kiểm tra xem tranh chấp có thể được giải quyết hay không
     * 
     * @return bool
     */
    public function canBeResolved(): bool
    {
        return $this === self::PROCESSING;
    }

    /**
     * Check if dispute can be cancelled
     * 
     * Kiểm tra xem tranh chấp có thể bị hủy hay không
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return in_array($this, [self::PENDING, self::PROCESSING]);
    }

    /**
     * Check if dispute is active
     * 
     * Kiểm tra xem tranh chấp có đang hoạt động hay không
     * 
     * @return bool
     */
    public function isActive(): bool
    {
        return in_array($this, [self::PENDING, self::PROCESSING]);
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
