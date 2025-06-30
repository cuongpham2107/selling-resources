<?php

namespace App\Filament\Resources\CustomerBalances\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;
class CustomerBalanceForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('customer_id')
                    ->label('Khách hàng')
                    ->relationship('customer', 'username')
                    ->disabled()
                    ->required()
                    ->searchable()
                    ->preload(),
                    
                TextInput::make('balance')
                    ->label('Số dư')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->minValue(0)
                    ->suffix('VNĐ')
                    ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(','),
                    
                TextInput::make('locked_balance')
                    ->label('Số dư bị khóa')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->minValue(0)
                    ->suffix('VNĐ')
                    ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(','),
            ])->columns(3);
    }
}
