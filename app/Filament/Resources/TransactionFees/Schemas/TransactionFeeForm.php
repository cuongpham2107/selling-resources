<?php

namespace App\Filament\Resources\TransactionFees\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;


class TransactionFeeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Cấu hình phí giao dịch')
                    ->description('Thiết lập phí và thưởng cho các giao dịch')
                    ->schema([
                        TextInput::make('min_amount')
                            ->label('Số tiền tối thiểu')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->suffix('VNĐ')
                             ->mask(RawJs::make('$money($input)'))
                             ->stripCharacters(','),
                            
                        TextInput::make('max_amount')
                            ->label('Số tiền tối đa')
                            ->numeric()
                            ->minValue(0)
                            ->suffix('VNĐ')
                             ->mask(RawJs::make('$money($input)'))
                             ->stripCharacters(','),
                            
                        TextInput::make('fee_amount')
                            ->label('Phí cố định')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->suffix('VNĐ')
                             ->mask(RawJs::make('$money($input)'))
                             ->stripCharacters(','),
                            
                        TextInput::make('fee_percentage')
                            ->label('Phí theo phần trăm')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('%'),
                            
                        TextInput::make('daily_fee_percentage')
                            ->label('Phí hàng ngày')
                            ->required()
                            ->numeric()
                            ->default(20)
                            ->minValue(0)
                            ->maxValue(100)
                            ->suffix('%'),
                            
                        TextInput::make('points_reward')
                            ->label('Thưởng C')
                            ->required()
                            ->numeric()
                            ->minValue(0)
                            ->suffix('C')
                            ->mask(RawJs::make('$money($input)'))
                            ->stripCharacters(','),
                            
                        Toggle::make('is_active')
                            ->label('Kích hoạt')
                            ->required(),
                    ])
                    ->columns(2),
            ]);
    }
}
