<?php

namespace App\States\StoreTransaction;

/**
 * Completed State - Giao dịch cửa hàng đã hoàn thành
 * 
 * Giao dịch đã hoàn thành thành công
 * Đây là trạng thái cuối cùng, không thể chuyển đổi thêm
 */
class CompletedState extends StoreTransactionState
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

    /**
     * Kiểm tra xem có thể hủy giao dịch hay không
     * Không thể hủy giao dịch đã hoàn thành
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem có thể tạo tranh chấp hay không
     * Có thể tranh chấp trong vòng 7 ngày sau khi hoàn thành
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return true; // Logic kiểm tra 7 ngày sẽ được implement trong business logic
    }

    /**
     * Kiểm tra xem có thể hoàn thành hay không
     * Đã hoàn thành rồi nên không thể hoàn thành lại
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return false;
    }
}
