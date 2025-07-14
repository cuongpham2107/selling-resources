<?php

namespace App\States\IntermediateTransaction;

/**
 * Expired State - Trạng thái giao dịch đã hết hạn
 * 
 * Giao dịch chuyển sang trạng thái này khi:
 * - Hết thời gian expires_at + grace period 1 giờ
 * - Không có xác nhận hoặc tranh chấp
 * - Tiền được hoàn lại cho buyer (trừ phí)
 */
class ExpiredState extends IntermediateTransactionState
{
    /**
     * Get the human-readable label for this state
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return 'Đã hết hạn';
    }

    /**
     * Get the color for UI display
     * 
     * @return string
     */
    public function getColor(): string
    {
        return 'gray';
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
     * Check if this state can transition to another state
     * Expired state is final - no transitions allowed
     * 
     * @param mixed $newState
     * @param mixed ...$transitionArgs
     * @return bool
     */
    public function canTransitionTo($newState, ...$transitionArgs): bool
    {
        return false; // Expired is a final state
    }

    /**
     * Check if this is a final state
     * 
     * @return bool
     */
    public function isFinal(): bool
    {
        return true;
    }

    /**
     * Check if transaction can be cancelled from this state
     * 
     * @return bool
     */
    public function canBeCancelled(): bool
    {
        return false; // Already expired
    }

    /**
     * Check if transaction can be disputed from this state
     * 
     * @return bool
     */
    public function canBeDisputed(): bool
    {
        return false; // Cannot dispute expired transactions
    }

    /**
     * Get description for this state
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return 'Giao dịch đã hết hạn và được hoàn tiền (trừ phí)';
    }
}