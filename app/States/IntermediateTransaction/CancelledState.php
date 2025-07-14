<?php

namespace App\States\IntermediateTransaction;

/**
 * Cancelled State - Giao dịch đã bị hủy
 * 
 * Giao dịch đã bị hủy bởi người mua hoặc do tranh chấp
 * Đây là trạng thái cuối cùng, không thể chuyển đổi thêm
 */
class CancelledState extends IntermediateTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đã hủy';
    }

    /**
     * Get the color for status badge
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'danger';
    }

    /**
     * Get the icon for the state
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return 'heroicon-o-x-circle';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đã bị hủy';
    }

    /**
     * Check if this is a final state
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return true; // Đây là trạng thái cuối cùng
    }
}
