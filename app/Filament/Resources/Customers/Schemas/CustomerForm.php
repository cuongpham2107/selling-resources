<?php

namespace App\Filament\Resources\Customers\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use App\Models\Customer;

class CustomerForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin cơ bản')
                    ->schema([
                        TextInput::make('username')
                            ->label('Tên đăng nhập')
                            ->required()
                            ->unique(Customer::class, 'username', ignoreRecord: true)
                            ->maxLength(50),
                        
                        TextInput::make('email')
                            ->label('Email')
                            ->email()
                            ->required()
                            ->unique(Customer::class, 'email', ignoreRecord: true),
                        
                        TextInput::make('phone')
                            ->label('Số điện thoại')
                            ->tel()
                            ->maxLength(20),
                        
                        TextInput::make('password')
                            ->label('Mật khẩu')
                            ->password()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(fn ($state) => filled($state))
                            ->minLength(8),
                    ])
                    ->columns(4)
                    ->columnSpanFull(),

                Section::make('Trạng thái & Giới thiệu')
                    ->schema([
                        
                        TextInput::make('referral_code')
                            ->label('Mã giới thiệu')
                            ->disabled()
                            ->dehydrated(false)
                            ->placeholder('Tự động tạo khi lưu')
                            ->helperText('Mã 8 ký tự ngẫu nhiên sẽ được tự động tạo'),
                        
                        Select::make('referred_by')
                            ->label('Người giới thiệu')
                            ->relationship('referrer', 'username')
                            ->searchable()
                            ->preload(),
                        Toggle::make('is_active')
                            ->label('Hoạt động')
                            ->inline(false)
                            ->default(true),
                        
                    ])->columns(3)->columnSpanFull(),

                Section::make('Xác thực KYC')
                    ->schema([
                        Textarea::make('kyc_data')
                            ->label('Dữ liệu KYC (JSON)')
                            ->rows(4)
                            ->columnSpanFull()
                            ->formatStateUsing(fn ($state) => is_array($state) ? json_encode($state, JSON_PRETTY_PRINT) : $state)
                            ->dehydrateStateUsing(fn ($state) => json_decode($state, true)),
                        DateTimePicker::make('kyc_verified_at')
                            ->label('Thời gian xác thực KYC'),
                    ])->columnSpanFull(),
            ]);
    }
}
