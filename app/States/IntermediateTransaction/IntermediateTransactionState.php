<?php

namespace App\States\IntermediateTransaction;

use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

/**
 * Abstract base class cho tất cả IntermediateTransaction states
 * 
 * Định nghĩa interface chung và methods cần thiết cho state machine
 */
abstract class IntermediateTransactionState extends State
{
    /**
     * Get Vietnamese label for the state
     * 
     * Lấy nhãn tiếng Việt cho trạng thái
     * 
     * @return string
     */
    abstract public function getLabel(): string;

    /**
     * Get the color for status badge
     * 
     * Lấy màu cho badge trạng thái
     * 
     * @return string
     */
    abstract public function getColor(): string;

    /**
     * Get the icon for the state
     * 
     * Lấy icon cho trạng thái
     * 
     * @return string
     */
    abstract public function getIcon(): string;

    /**
     * Check if this is a final state
     * 
     * Kiểm tra xem đây có phải là trạng thái cuối cùng hay không
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return false;
    }

    /**
     * Check if transaction can be cancelled from this state
     * 
     * Kiểm tra xem giao dịch có thể bị hủy từ trạng thái này hay không
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return false;
    }

    /**
     * Check if transaction can be disputed from this state
     * 
     * Kiểm tra xem giao dịch có thể bị tranh chấp từ trạng thái này hay không
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return false;
    }

    /**
     * Get description for the state
     * 
     * Lấy mô tả cho trạng thái
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return '';
    }

    /**
     * Configure the state machine
     * 
     * Cấu hình state machine
     * 
     * @param StateConfig $stateConfig
     * @return StateConfig
     */
    public static function config(): StateConfig
    {
        return parent::config()
            ->default(PendingState::class)
            ->allowTransition(PendingState::class, ConfirmedState::class)
            ->allowTransition(PendingState::class, CancelledState::class)
            ->allowTransition(PendingState::class, ExpiredState::class)
            ->allowTransition(ConfirmedState::class, SellerSentState::class)
            ->allowTransition(ConfirmedState::class, DisputedState::class)
            ->allowTransition(ConfirmedState::class, CancelledState::class)
            ->allowTransition(ConfirmedState::class, ExpiredState::class)
            ->allowTransition(SellerSentState::class, CompletedState::class)
            ->allowTransition(SellerSentState::class, DisputedState::class)
            ->allowTransition(SellerSentState::class, ExpiredState::class)
            ->allowTransition(DisputedState::class, CompletedState::class)
            ->allowTransition(DisputedState::class, CancelledState::class);
    }
}
