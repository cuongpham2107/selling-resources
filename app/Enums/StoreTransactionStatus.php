<?php

namespace App\Enums;

enum StoreTransactionStatus: string
{
    case PENDING = 'pending';           // Chờ xác nhận từ người bán
    case PROCESSING = 'processing';     // Đang giao dịch (đã xác nhận, có thể chat)
    case COMPLETED = 'completed';       // Hoàn thành
    case DISPUTED = 'disputed';         // Tranh chấp
    case CANCELLED = 'cancelled';       // Đã hủy

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
            self::PROCESSING => 'Đang giao dịch',
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
            self::PENDING => 'warning',      // Màu vàng cho chờ xác nhận
            self::PROCESSING => 'primary',   // Màu xanh cho đang giao dịch
            self::COMPLETED => 'success',    // Màu xanh lá cho hoàn thành
            self::DISPUTED => 'danger',      // Màu đỏ cho tranh chấp
            self::CANCELLED => 'secondary',  // Màu xám cho đã hủy
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
            self::PENDING => [self::PROCESSING, self::CANCELLED], // Từ chờ xác nhận → đang giao dịch hoặc hủy
            self::PROCESSING => [self::COMPLETED, self::DISPUTED, self::CANCELLED], // Từ đang giao dịch → hoàn thành/tranh chấp/hủy
            self::COMPLETED => [], // Trạng thái cuối
            self::DISPUTED => [self::COMPLETED, self::CANCELLED], // Từ tranh chấp → giải quyết
            self::CANCELLED => [], // Trạng thái cuối
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
        return in_array($this, [self::PENDING, self::PROCESSING]);
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
        return $this === self::PROCESSING; // Chỉ khi đang giao dịch mới có thể tranh chấp
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
        return $this === self::PROCESSING; // Chỉ khi đang giao dịch mới có thể hoàn thành
    }

    /**
     * Check if transaction can be confirmed (seller action)
     * 
     * Kiểm tra xem giao dịch có thể được xác nhận hay không (hành động của người bán)
     * 
     * @return bool
     */
    public function canBeConfirmed(): bool
    {
        return $this === self::PENDING; // Chỉ khi chờ xác nhận mới có thể xác nhận
    }

    /**
     * Check if chat is available for this transaction
     * 
     * Kiểm tra xem có thể chat trong giao dịch này hay không
     * 
     * @return bool
     */
    public function canChat(): bool
    {
        return in_array($this, [self::PROCESSING, self::DISPUTED]); // Chỉ chat khi đang giao dịch hoặc tranh chấp
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
