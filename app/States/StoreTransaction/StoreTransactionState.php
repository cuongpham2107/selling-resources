<?php

namespace App\States\StoreTransaction;

use Spatie\ModelStates\State;
use Spatie\ModelStates\StateConfig;

/**
 * Abstract base class cho tất cả StoreTransaction states
 * 
 * Định nghĩa interface chung và methods cần thiết cho state machine
 */
abstract class StoreTransactionState extends State
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
     * Check if transaction can be completed from this state
     * 
     * Kiểm tra xem giao dịch có thể hoàn thành từ trạng thái này hay không
     * 
     * @return bool
     */
    public function canBeCompleted(): bool
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
     * @return StateConfig
     */
    public static function config(): StateConfig
    {
        return parent::config()
            ->default(ProcessingState::class)
            ->allowTransition(ProcessingState::class, CompletedState::class)
            ->allowTransition(ProcessingState::class, DisputedState::class)
            ->allowTransition(ProcessingState::class, CancelledState::class)
            ->allowTransition(DisputedState::class, CompletedState::class)
            ->allowTransition(DisputedState::class, CancelledState::class);
    }
}
