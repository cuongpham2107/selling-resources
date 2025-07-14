<?php

namespace App\States\IntermediateTransaction;

/**
 * Completed State - Giao dịch đã hoàn thành
 * 
 * Người mua đã xác nhận nhận được hàng, giao dịch kết thúc thành công
 * Đây là trạng thái cuối cùng, không thể chuyển đổi thêm
 */
class CompletedState extends IntermediateTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Hoàn thành';
    }

    /**
     * Get the color for status badge
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'success';
    }

    /**
     * Get the icon for the state
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return 'heroicon-o-check-badge';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đã hoàn thành thành công';
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
