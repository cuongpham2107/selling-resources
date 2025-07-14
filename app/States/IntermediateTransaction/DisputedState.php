<?php

namespace App\States\IntermediateTransaction;

/**
 * Disputed State - Giao dịch đang tranh chấp
 * 
 * Có tranh chấp giữa người mua và người bán, cần can thiệp từ admin
 * Có thể giải quyết thành hoàn thành hoặc hủy bỏ
 */
class DisputedState extends IntermediateTransactionState
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
}
