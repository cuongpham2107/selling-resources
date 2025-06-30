<?php

namespace App\Filament\Resources\WalletTransactions\Schemas;

use App\Enums\PaymentMethod;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\KeyValue;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;

class WalletTransactionForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->disabled()
                    ->helperText('Tự động tạo khi thêm mới'),
                    
                Select::make('customer_id')
                    ->label('Khách hàng')
                    ->relationship('customer', 'username')
                    ->searchable()
                    ->preload()
                    ->required(),
                    
                Select::make('type')
                    ->label('Loại giao dịch')
                    ->options(WalletTransactionType::options())
                    ->required(),
                    
                TextInput::make('amount')
                    ->label('Số tiền (VND)')
                     ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(',')
                    ->numeric()
                    ->prefix('₫')
                    ->required(),
                    
                TextInput::make('fee')
                    ->label('Phí (VND)')
                     ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(',')
                    ->numeric()
                    ->prefix('₫')
                    ->default(0),
                    
                TextInput::make('net_amount')
                    ->label('Số tiền thực nhận (VND)')
                     ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(',')
                    ->numeric()
                    ->prefix('₫')
                    ->disabled()
                    ->helperText('Tự động tính: Số tiền - Phí (đối với rút tiền)'),
                    
                Select::make('status')
                    ->label('Trạng thái')
                    ->options(WalletTransactionStatus::options())
                    ->required()
                    ->default('pending'),
                    
                Select::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->options(PaymentMethod::options())
                    ->nullable(),
                    
                Textarea::make('description')
                    ->label('Mô tả')
                    ->rows(3)
                    ->columnSpanFull(),
                    
                Select::make('recipient_id')
                    ->label('Người nhận')
                    ->relationship('recipient', 'username')
                    ->searchable()
                    ->preload()
                    ->nullable()
                    ->visible(fn ($get) => in_array($get('type'), ['transfer_in', 'transfer_out'])),
                    
                Select::make('sender_id')
                    ->label('Người gửi')
                    ->relationship('sender', 'username')
                    ->searchable()
                    ->preload()
                    ->nullable()
                    ->visible(fn ($get) => in_array($get('type'), ['transfer_in', 'transfer_out'])),
                    
                Textarea::make('note')
                    ->label('Ghi chú chuyển khoản')
                    ->rows(2)
                    ->columnSpanFull()
                    ->visible(fn ($get) => in_array($get('type'), ['transfer_in', 'transfer_out'])),
                    
                TextInput::make('vnpay_txn_ref')
                    ->label('Mã tham chiếu VNPay')
                    ->disabled()
                    ->visible(fn ($get) => $get('payment_method') === 'vnpay'),
                    
                TextInput::make('vnpay_transaction_no')
                    ->label('Số giao dịch VNPay')
                    ->disabled()
                    ->visible(fn ($get) => $get('payment_method') === 'vnpay'),
                    
                TextInput::make('vnpay_bank_code')
                    ->label('Mã ngân hàng VNPay')
                    ->disabled()
                    ->visible(fn ($get) => $get('payment_method') === 'vnpay'),
                    
                TextInput::make('vnpay_response_code')
                    ->label('Mã phản hồi VNPay')
                    ->disabled()
                    ->visible(fn ($get) => $get('payment_method') === 'vnpay'),
                    
                KeyValue::make('withdrawal_info')
                    ->label('Thông tin ngân hàng rút tiền (JSON)')
                    ->columnSpanFull()
                    ->visible(fn ($get) => $get('type') === 'withdrawal'),
                    
                DateTimePicker::make('processed_at')
                    ->label('Thời gian xử lý'),
                    
                DateTimePicker::make('completed_at')
                    ->label('Thời gian hoàn thành'),
            ]);
    }
}
