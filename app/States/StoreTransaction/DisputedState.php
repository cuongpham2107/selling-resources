<?php

namespace App\States\StoreTransaction;

/**
 * Disputed State - Giao dịch cửa hàng đang tranh chấp
 * 
 * Có tranh chấp giữa người mua và người bán, cần can thiệp từ admin
 * Có thể giải quyết thành hoàn thành hoặc hủy bỏ
 */
class DisputedState extends StoreTransactionState
{
    /**
     * Get Vietnamese label for the state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Tranh chấp';
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
        return 'heroicon-o-exclamation-triangle';
    }

    /**
     * Get description for the state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đang trong quá trình tranh chấp, cần can thiệp từ admin';
    }

    /**
     * Kiểm tra xem có thể hủy giao dịch hay không
     * Không thể hủy khi đang tranh chấp - cần admin xử lý
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem có thể tạo tranh chấp hay không
     * Đã đang tranh chấp rồi nên không thể tạo thêm
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return false;
    }

    /**
     * Kiểm tra xem có thể hoàn thành hay không
     * Không thể hoàn thành khi đang tranh chấp - cần admin xử lý
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
    {
        return false;
    }
}
