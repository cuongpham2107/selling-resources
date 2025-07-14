<?php

namespace App\Enums;

enum ReferralStatus: string
{
    case ACTIVE = 'active';
    case INACTIVE = 'inactive';
    case PENDING = 'pending';

    /**
     * Lấy nhãn tiếng Việt cho trạng thái
     * 
     * @return string
     */
    public function getLabel(): string
    {
        return match($this) {
            self::ACTIVE => 'Hoạt động',
            self::INACTIVE => 'Không hoạt động',
            self::PENDING => 'Chờ xử lý',
        };
    }

    /**
     * Lấy mô tả chi tiết cho trạng thái
     * 
     * @return string
     */
    public function getDescription(): string
    {
        return match($this) {
            self::ACTIVE => 'Mối quan hệ giới thiệu đang hoạt động và có thể nhận thưởng',
            self::INACTIVE => 'Mối quan hệ giới thiệu đã bị vô hiệu hóa',
            self::PENDING => 'Mối quan hệ giới thiệu đang chờ xử lý hoặc xác nhận',
        };
    }

    /**
     * Lấy màu badge cho trạng thái
     * 
     * @return string
     */
    public function getColor(): string
    {
        return match($this) {
            self::ACTIVE => 'success',
            self::INACTIVE => 'danger',
            self::PENDING => 'warning',
        };
    }

    /**
     * Lấy icon cho trạng thái
     * 
     * @return string
     */
    public function getIcon(): string
    {
        return match($this) {
            self::ACTIVE => 'heroicon-m-check-circle',
            self::INACTIVE => 'heroicon-m-x-circle',
            self::PENDING => 'heroicon-m-clock',
        };
    }

    /**
     * Lấy tất cả options cho form select
     * 
     * @return array
     */
    public static function getOptions(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [$case->value => $case->getLabel()])
            ->toArray();
    }

    /**
     * Kiểm tra xem trạng thái có thể nhận thưởng không
     * 
     * @return bool
     */
    public function canEarnRewards(): bool
    {
        return $this === self::ACTIVE;
    }

    /**
     * Kiểm tra xem có thể chuyển sang trạng thái khác không
     * 
     * @param ReferralStatus $newStatus
     * @return bool
     */
    public function canTransitionTo(ReferralStatus $newStatus): bool
    {
        return match($this) {
            self::PENDING => in_array($newStatus, [self::ACTIVE, self::INACTIVE]),
            self::ACTIVE => $newStatus === self::INACTIVE,
            self::INACTIVE => $newStatus === self::ACTIVE,
        };
    }
}
