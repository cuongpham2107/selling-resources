<?php

namespace App\Filament\Resources\PersonalStores\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;

class PersonalStoreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Tabs::make('Tabs')
                    ->tabs([
                        Tabs\Tab::make('Thông tin cửa hàng')
                            ->schema([
                                Section::make('Thông tin cơ bản')
                                    ->description('Thông tin chính của cửa hàng')
                                    ->schema([
                                        Select::make('owner_id')
                                            ->label('Chủ cửa hàng')
                                            ->relationship('owner', 'username')
                                            ->searchable()
                                            ->preload()
                                            ->required()
                                            ->createOptionForm([
                                                TextInput::make('username')
                                                    ->label('Tên đăng nhập')
                                                    ->required()
                                                    ->maxLength(255),
                                                TextInput::make('email')
                                                    ->label('Email')
                                                    ->email()
                                                    ->required()
                                                    ->maxLength(255),
                                                TextInput::make('phone')
                                                    ->label('Số điện thoại')
                                                    ->tel()
                                                    ->maxLength(20),
                                            ]),

                                        TextInput::make('store_name')
                                            ->label('Tên cửa hàng')
                                            ->required()
                                            ->maxLength(255),

                                        Textarea::make('description')
                                            ->label('Mô tả cửa hàng')
                                            ->rows(3)
                                            ->maxLength(1000)
                                            ->columnSpanFull(),
                                    ])
                                    ->columns(2),

                                Section::make('Hình ảnh & Trạng thái')
                                    ->description('Logo và trạng thái hoạt động')
                                    ->schema([
                                        FileUpload::make('avatar')
                                            ->label('Logo cửa hàng')
                                            ->image()
                                            ->disk('public')
                                            ->maxSize(2048),

                                        Toggle::make('is_active')
                                            ->label('Hoạt động')
                                            ->default(true),
                                    ])
                                    ->columns(2),
                            ]),

                        Tabs\Tab::make('Quản lý & Kiểm duyệt')
                            ->schema([
                                Section::make('Thông tin kiểm duyệt')
                                    ->description('Thông tin khóa và kiểm duyệt từ admin')
                                    ->schema([
                                        Toggle::make('is_locked')
                                            ->label('Khóa cửa hàng')
                                            ->disabled(),

                                        Select::make('locked_by')
                                            ->label('Khóa bởi')
                                            ->relationship('lockedBy', 'name')
                                            ->disabled(),

                                        DateTimePicker::make('locked_at')
                                            ->label('Ngày khóa')
                                            ->disabled(),

                                        Textarea::make('lock_reason')
                                            ->label('Lý do khóa')
                                            ->disabled()
                                            ->columnSpanFull(),
                                    ])
                                    ->columns(3),

                                Section::make('Thông tin hệ thống')
                                    ->description('Thời gian tạo và cập nhật')
                                    ->schema([
                                        Placeholder::make('created_at')
                                            ->label('Thời gian tạo')
                                            ->content(fn ($record) => $record?->created_at?->format('d/m/Y H:i:s'))
                                            ->visibleOn('edit'),

                                        Placeholder::make('updated_at')
                                            ->label('Cập nhật lần cuối')
                                            ->content(fn ($record) => $record?->updated_at?->format('d/m/Y H:i:s'))
                                            ->visibleOn('edit'),
                                    ])
                                    ->columns(2),
                            ]),
                    ])
                    ->columnSpanFull(),
            ]);
    }
}
