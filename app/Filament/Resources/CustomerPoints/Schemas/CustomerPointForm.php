<?php

namespace App\Filament\Resources\CustomerPoints\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;

class CustomerPointForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin C khách hàng')
                    ->description('Quản lý số C của khách hàng')
                    ->schema([
                        Select::make('customer_id')
                            ->label('Khách hàng')
                            ->relationship('customer', 'username')
                            ->required()
                            ->searchable()
                            ->preload(),
                            
                        TextInput::make('points')
                            ->label('Số C')
                            ->required()
                            ->numeric()
                            ->default(0)
                            ->minValue(0)
                            ->suffix('C')
                            ->mask(RawJs::make('$money($input)'))
                            ->stripCharacters(','),
                    ]),
            ]);
    }
}
