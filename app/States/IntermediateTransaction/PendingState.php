<?php

namespace App\States\IntermediateTransaction;

/**
 * Pending State - Giao dịch đang chờ xác nhận từ người mua
 * 
 * Trạng thái ban đầu khi giao dịch trung gian được tạo
 * Người mua cần xác nhận để chuyển sang trạng thái tiếp theo
 */
class PendingState extends IntermediateTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đang chờ xác nhận';
    }

    /**
     * Get the color for status badge
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'warning';
    }

    /**
     * Get the icon for the state
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return 'heroicon-o-clock';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đang chờ người mua xác nhận';
    }

    /**
     * Check if transaction can be cancelled from this state
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return true; // Có thể hủy khi đang chờ xác nhận
    }
}
