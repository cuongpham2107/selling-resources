<?php

namespace App\States\StoreTransaction;

/**
 * Pending State - Giao dịch cửa hàng chờ xác nhận
 * 
 * Trạng thái ban đầu khi giao dịch được tạo
 * Chờ người bán xác nhận để chuyển sang trạng thái "Đang giao dịch"
 */
class PendingState extends StoreTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Chờ xác nhận';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Đang chờ người bán xác nhận giao dịch';
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
     * Kiểm tra xem có thể hủy giao dịch hay không
     * Có thể hủy khi đang chờ xác nhận
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return true;
    }

    /**
     * Kiểm tra xem có thể tạo tranh chấp hay không
     * Không thể tranh chấp khi chưa bắt đầu giao dịch
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem có thể hoàn thành hay không
     * Không thể hoàn thành khi chưa bắt đầu giao dịch
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem có thể xác nhận hay không
     * Có thể xác nhận khi đang chờ
     * 
     * @return bool
     */
    public function canBeConfirmed(): bool
    {
        return true;
    }

    /**
     * Kiểm tra xem có thể chat hay không
     * Không thể chat khi chưa xác nhận
     * 
     * @return bool
     */
    public function canChat(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem đây có phải trạng thái cuối cùng hay không
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return false;
    }
}
