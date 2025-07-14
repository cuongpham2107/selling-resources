<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case DEBIT = 'debit';
    case DEPOSIT = 'deposit';
    case WITHDRAWAL = 'withdrawal';
    case TRANSFER_IN = 'transfer_in';
    case TRANSFER_OUT = 'transfer_out';

    public function label(): string
    {
        return match($this) {
            self::DEBIT => 'Trừ tiền',
            self::DEPOSIT => 'Nạp tiền',
            self::WITHDRAWAL => 'Rút tiền',
            self::TRANSFER_IN => 'Nhận chuyển khoản',
            self::TRANSFER_OUT => 'Chuyển khoản',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [$case->value => $case->label()])
            ->toArray();
    }
}
