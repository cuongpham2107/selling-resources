<?php

namespace App\Filament\Resources\StoreTransactions\Schemas;

use App\Models\StoreProduct;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Get;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;

class StoreTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->disabled()
                    ->visibleOn('edit'),

                Select::make('buyer_id')
                    ->label('Người mua')
                    ->relationship('buyer', 'username')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->columnSpan(1),

                Select::make('seller_id')
                    ->label('Người bán')
                    ->relationship('seller', 'username')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->columnSpan(1),

                Select::make('product_id')
                    ->label('Sản phẩm')
                    ->relationship('product', 'name')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->columnSpan(2),

                TextInput::make('amount')
                    ->label('Số tiền')
                    ->numeric()
                    ->required()
                    ->suffix('VNĐ')
                    ->minValue(0)
                    ->columnSpan(1),

                TextInput::make('fee')
                    ->label('Phí giao dịch')
                    ->numeric()
                    ->suffix('VNĐ')
                    ->minValue(0)
                    ->default(0)
                    ->columnSpan(1),

                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                    ])
                    ->default('processing')
                    ->required()
                    ->columnSpan(1),

                Select::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->options([
                        'balance' => 'Số dư tài khoản',
                        'bank' => 'Chuyển khoản ngân hàng',
                        'momo' => 'Ví MoMo',
                        'zalo_pay' => 'ZaloPay',
                    ])
                    ->default('balance')
                    ->columnSpan(1),

                DateTimePicker::make('completed_at')
                    ->label('Thời gian hoàn thành')
                    ->displayFormat('d/m/Y H:i')
                    ->timezone('Asia/Ho_Chi_Minh')
                    ->columnSpan(1),

                DateTimePicker::make('auto_complete_at')
                    ->label('Tự động hoàn thành lúc')
                    ->displayFormat('d/m/Y H:i')
                    ->timezone('Asia/Ho_Chi_Minh')
                    ->required()
                    ->columnSpan(1),

                Toggle::make('buyer_early_complete')
                    ->label('Người mua hoàn thành sớm')
                    ->default(false)
                    ->columnSpan(2),

                Textarea::make('notes')
                    ->label('Ghi chú')
                    ->rows(3)
                    ->maxLength(1000)
                    ->columnSpan(2),

                Placeholder::make('created_at')
                    ->label('Thời gian tạo')
                    ->content(fn ($record) => $record?->created_at?->format('d/m/Y H:i:s'))
                    ->visibleOn('edit')
                    ->columnSpan(1),

                Placeholder::make('updated_at')
                    ->label('Cập nhật lần cuối')
                    ->content(fn ($record) => $record?->updated_at?->format('d/m/Y H:i:s'))
                    ->visibleOn('edit')
                    ->columnSpan(1),
            ])
            ->columns(2);
    }
}
