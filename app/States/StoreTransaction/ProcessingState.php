<?php

namespace App\States\StoreTransaction;

/**
 * Processing State - Giao dịch cửa hàng đang giao dịch
 * 
 * Trạng thái khi người bán đã xác nhận giao dịch
 * Người mua và người bán có thể chat và trao đổi sản phẩm
 */
class ProcessingState extends StoreTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đang giao dịch';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đang được thực hiện, người mua và người bán có thể chat và trao đổi sản phẩm';
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
        return 'heroicon-o-cog-6-tooth';
    }

    /**
     * Check if transaction can be cancelled from this state
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return true; // Có thể hủy khi đang xử lý
    }

    /**
     * Check if transaction can be disputed from this state
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return true; // Có thể tranh chấp khi đang xử lý
    }

    /**
     * Check if transaction can be completed from this state
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return true; // Có thể hoàn thành từ trạng thái đang xử lý
    }
}
