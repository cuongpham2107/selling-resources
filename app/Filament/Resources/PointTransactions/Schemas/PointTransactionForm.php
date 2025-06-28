<?php

namespace App\Filament\Resources\PointTransactions\Schemas;

use App\Enums\PointTransactionType;
use App\Enums\TransactionType;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class PointTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin giao dịch C')
                    ->description('Chi tiết giao dịch C của khách hàng')
                    ->schema([
                        Select::make('customer_id')
                            ->label('Khách hàng')
                            ->relationship('customer', 'username')
                            ->required()
                            ->searchable()
                            ->preload(),
                            
                        Select::make('type')
                            ->label('Loại giao dịch')
                            ->options(PointTransactionType::getOptions())
                            ->required(),
                            
                        TextInput::make('amount')
                            ->label('Số C')
                            ->numeric()
                            ->required()
                            ->minValue(1)
                            ->suffix('C'),
                            
                        TextInput::make('balance_after')
                            ->label('Số dư sau giao dịch')
                            ->numeric()
                            ->required()
                            ->minValue(0)
                            ->suffix('C'),
                    ])
                    ->columns(2),
                    
                Section::make('Thông tin liên quan')
                    ->description('Giao dịch và khách hàng liên quan')
                    ->schema([
                        Select::make('related_transaction_type')
                            ->label('Loại giao dịch liên quan')
                            ->options(TransactionType::getOptions())
                            ->nullable(),
                            
                        TextInput::make('related_transaction_id')
                            ->label('ID giao dịch liên quan')
                            ->numeric()
                            ->nullable(),
                            
                        Select::make('related_customer_id')
                            ->label('Khách hàng liên quan')
                            ->relationship('relatedCustomer', 'username')
                            ->searchable()
                            ->preload()
                            ->nullable(),
                            
                        Textarea::make('description')
                            ->label('Mô tả')
                            ->rows(3)
                            ->nullable()
                            ->columnSpanFull(),
                    ])
                    ->columns(3),
            ]);
    }
}
