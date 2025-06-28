<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case VNPAY = 'vnpay';
    case BANK_TRANSFER = 'bank_transfer';
    case MOMO = 'momo';
    case ZALO_PAY = 'zalo_pay';

    public function label(): string
    {
        return match($this) {
            self::VNPAY => 'VNPay',
            self::BANK_TRANSFER => 'Chuyển khoản ngân hàng',
            self::MOMO => 'MoMo',
            self::ZALO_PAY => 'ZaloPay',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [$case->value => $case->label()])
            ->toArray();
    }
}
