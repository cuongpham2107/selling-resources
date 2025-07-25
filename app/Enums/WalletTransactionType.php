<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    // deposit', 'withdrawal', 'buy', 'sell'
    case DEPOSIT = 'deposit';
    case WITHDRAWAL = 'withdrawal';
    case BUY = 'buy';
    case SELL = 'sell';


    public function label(): string
    {
        return match($this) {
            self::DEPOSIT => 'Nạp tiền',
            self::WITHDRAWAL => 'Rút tiền',
            self::BUY => 'Mua',
            self::SELL => 'Bán',
        };
    }

    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn($case) => [$case->value => $case->label()])
            ->toArray();
    }
}
