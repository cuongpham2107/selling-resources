<?php

namespace App\Filament\Resources\PointTransactions\Schemas;

use App\Enums\PointTransactionType;
use App\Enums\TransactionType;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;

class PointTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('point_transaction_tabs')
                    ->tabs([
                        Tabs\Tab::make('Thông tin cơ bản')
                            ->icon('heroicon-m-information-circle')
                            ->schema([
                                Select::make('customer_id')
                                    ->label('Khách hàng')
                                    ->helperText('Chọn khách hàng thực hiện giao dịch điểm')
                                    ->relationship('customer', 'username')
                                    ->required()
                                    ->searchable()
                                    ->preload(),
                                    
                                Select::make('type')
                                    ->label('Loại giao dịch')
                                    ->helperText('Chọn loại giao dịch điểm phù hợp')
                                    ->options([
                                        'earned' => 'Kiếm được từ giao dịch',
                                        'referral_bonus' => 'Thưởng giới thiệu',
                                        'sent' => 'Gửi cho người khác',
                                        'received' => 'Nhận từ người khác',
                                        'exchanged' => 'Đổi thành tiền/hàng',
                                        'spend' => 'Tiêu dùng',
                                        'transfer' => 'Chuyển điểm',
                                        'admin_adjust' => 'Điều chỉnh bởi admin',
                                    ])
                                    ->required(),
                                    
                                TextInput::make('amount')
                                    ->label('Số điểm')
                                    ->helperText('Nhập số điểm cho giao dịch (chỉ nhập số dương)')
                                    ->numeric()
                                    ->required()
                                    ->minValue(1)
                                    ->suffix('điểm')
                                    ->mask(RawJs::make('$money($input)'))
                                    ->stripCharacters(','),
                                    
                                TextInput::make('balance_after')
                                    ->label('Số dư sau giao dịch')
                                    ->helperText('Số dư điểm còn lại sau khi thực hiện giao dịch')
                                    ->numeric()
                                    ->required()
                                    ->minValue(0)
                                    ->suffix('điểm')
                                    ->mask(RawJs::make('$money($input)'))
                                    ->stripCharacters(','),
                            ])
                            ->columns(2),
                            
                        Tabs\Tab::make('Thông tin bổ sung')
                            ->icon('heroicon-m-link')
                            ->schema([
                                TextInput::make('related_transaction_id')
                                    ->label('ID giao dịch liên quan')
                                    ->helperText('ID của giao dịch gốc (nếu có)')
                                    ->numeric()
                                    ->nullable(),
                                    
                                Select::make('related_transaction_type')
                                    ->label('Loại giao dịch liên quan')
                                    ->helperText('Chọn loại giao dịch gốc tạo ra điểm này (tùy chọn)')
                                    ->options([
                                        'intermediate_transaction' => 'Giao dịch trung gian',
                                        'store_transaction' => 'Giao dịch cửa hàng',
                                        'wallet_transaction' => 'Giao dịch ví',
                                        'referral' => 'Giới thiệu',
                                    ])
                                    ->nullable(),
                                Select::make('related_customer_id')
                                    ->label('Người được giới thiệu')
                                    ->helperText('Người mà khách hàng này đã giới thiệu (chỉ áp dụng cho thưởng giới thiệu)')
                                    ->relationship('relatedCustomer', 'username')
                                    ->searchable()
                                    ->preload()
                                    ->nullable(),
                                    
                                Textarea::make('description')
                                    ->label('Mô tả giao dịch')
                                    ->helperText('Mô tả chi tiết về giao dịch điểm này (tùy chọn)')
                                    ->placeholder('Ví dụ: Thưởng giới thiệu khi khách hàng ABC hoàn thành giao dịch đầu tiên...')
                                    ->rows(4)
                                    ->nullable()
                                    ->default('')
                                    ->columnSpanFull(),
                            ])
                            ->columns(3),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
