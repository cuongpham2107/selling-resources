<?php

namespace App\States\IntermediateTransaction;

/**
 * Confirmed State - Giao dịch đã được người mua xác nhận
 * 
 * Người mua đã xác nhận giao dịch, chờ người bán gửi hàng
 * Có thể hủy hoặc tranh chấp từ trạng thái này
 */
class ConfirmedState extends IntermediateTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đã xác nhận';
    }

    /**
     * Get the color for status badge
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'info';
    }

    /**
     * Get the icon for the state
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return 'heroicon-o-check-circle';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đã được xác nhận, chờ người bán gửi hàng';
    }

    /**
     * Check if transaction can be cancelled from this state
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return true; // Có thể hủy trước khi người bán gửi hàng
    }

    /**
     * Check if transaction can be disputed from this state
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return true; // Có thể tranh chấp sau khi xác nhận
    }
}
