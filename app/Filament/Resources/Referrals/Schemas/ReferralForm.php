<?php

namespace App\Filament\Resources\Referrals\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;

class ReferralForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin giới thiệu')
                    ->description('Chi tiết về mối quan hệ giới thiệu')
                    ->schema([
                        Select::make('referrer_id')
                            ->label('Người giới thiệu')
                            ->relationship('referrer', 'username')
                            ->required()
                            ->searchable()
                            ->preload(),
                            
                        Select::make('referred_id')
                            ->label('Người được giới thiệu')
                            ->relationship('referred', 'username')
                            ->required()
                            ->searchable()
                            ->preload(),
                            
                        TextInput::make('total_points_earned')
                            ->label('Tổng C kiếm được')
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->suffix('C')
                             ->mask(RawJs::make('$money($input)'))
                             ->stripCharacters(','),
                            
                        TextInput::make('successful_transactions')
                            ->label('Số giao dịch thành công')
                            ->numeric()
                            ->default(0)
                            ->minValue(0),
                            
                        DateTimePicker::make('first_transaction_at')
                            ->label('Lần giao dịch đầu tiên')
                            ->nullable(),
                    ])
                    ->columns(2),
            ]);
    }
}
