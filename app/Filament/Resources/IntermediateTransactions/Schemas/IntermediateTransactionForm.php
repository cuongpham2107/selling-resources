<?php

namespace App\Filament\Resources\IntermediateTransactions\Schemas;

use App\Enums\IntermediateTransactionStatus;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;

class IntermediateTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Tabs')
                    ->tabs([
                        Tabs\Tab::make('Thông tin cơ bản')
                            ->schema([
                                Section::make('Chi tiết giao dịch')
                                    ->description('Thông tin chính của giao dịch trung gian')
                                    ->schema([
                                        TextInput::make('transaction_code')
                                            ->label('Mã giao dịch')
                                            ->disabled()
                                            ->dehydrated(false),
                                        
                                        Select::make('buyer_id')
                                            ->label('Người mua')
                                            ->relationship('buyer', 'username')
                                            ->searchable()
                                            ->preload()
                                            ->required(),
                                        
                                        Select::make('seller_id')
                                            ->label('Người bán')
                                            ->relationship('seller', 'username')
                                            ->searchable()
                                            ->preload()
                                            ->required(),
                                        
                                        Textarea::make('description')
                                            ->label('Mô tả')
                                            ->required()
                                            ->rows(3)
                                            ->columnSpanFull(),
                                    ])
                                    ->columns(2),
                                
                                Section::make('Thông tin tài chính')
                                    ->description('Số tiền và phí giao dịch')
                                    ->schema([
                                        TextInput::make('amount')
                                            ->label('Số tiền (VNĐ)')
                                            ->required()
                                            ->numeric()
                                            ->minValue(0)
                                            ->prefix('VNĐ'),
                                        
                                        TextInput::make('fee')
                                            ->label('Phí giao dịch (VNĐ)')
                                            ->numeric()
                                            ->default(0)
                                            ->prefix('VNĐ'),
                                        
                                        TextInput::make('duration_hours')
                                            ->label('Thời gian (giờ)')
                                            ->required()
                                            ->numeric()
                                            ->minValue(1)
                                            ->maxValue(168)
                                            ->suffix('giờ'),
                                    ])
                                    ->columns(3),
                            ]),
                            
                        Tabs\Tab::make('Trạng thái & Thời gian')
                            ->schema([
                                Section::make('Trạng thái giao dịch')
                                    ->description('Trạng thái hiện tại và thời gian quan trọng')
                                    ->schema([
                                        Select::make('status')
                                            ->label('Trạng thái')
                                            ->options(IntermediateTransactionStatus::getOptions())
                                            ->default(IntermediateTransactionStatus::PENDING->value)
                                            ->required(),
                                        
                                        DateTimePicker::make('expires_at')
                                            ->label('Thời gian hết hạn')
                                            ->required(),
                                    ])
                                    ->columns(2),
                                
                                Section::make('Lịch sử thời gian')
                                    ->description('Theo dõi các mốc thời gian quan trọng')
                                    ->schema([
                                        DateTimePicker::make('confirmed_at')
                                            ->label('Thời gian xác nhận'),
                                        
                                        DateTimePicker::make('seller_sent_at')
                                            ->label('Thời gian người bán gửi'),
                                        
                                        DateTimePicker::make('buyer_received_at')
                                            ->label('Thời gian người mua nhận'),
                                        
                                        DateTimePicker::make('completed_at')
                                            ->label('Thời gian hoàn thành'),
                                    ])
                                    ->columns(2),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
