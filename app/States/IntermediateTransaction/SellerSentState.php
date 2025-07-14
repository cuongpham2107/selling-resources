<?php

namespace App\States\IntermediateTransaction;

/**
 * Seller Sent State - Người bán đã gửi hàng
 * 
 * Người bán đã gửi hàng, chờ người mua xác nhận nhận được
 * Có thể tranh chấp từ trạng thái này
 */
class SellerSentState extends IntermediateTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đã gửi hàng';
    }

    /**
     * Get the color for status badge
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'primary';
    }

    /**
     * Get the icon for the state
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return 'heroicon-o-truck';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Người bán đã gửi hàng, chờ người mua xác nhận nhận được';
    }

    /**
     * Check if transaction can be disputed from this state
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return true; // Có thể tranh chấp sau khi hàng được gửi
    }
}
