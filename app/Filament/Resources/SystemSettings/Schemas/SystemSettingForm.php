<?php

namespace App\Filament\Resources\SystemSettings\Schemas;

use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class SystemSettingForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                TextInput::make('key')
                    ->label('Khóa cài đặt')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->columnSpan(1),

                Select::make('type')
                    ->label('Kiểu dữ liệu')
                    ->options([
                        'string' => 'Chuỗi',
                        'integer' => 'Số nguyên',
                        'decimal' => 'Số thập phân',
                        'boolean' => 'Đúng/Sai',
                        'json' => 'JSON',
                    ])
                    ->default('string')
                    ->required()
                    ->reactive()
                    ->columnSpan(1),

                Textarea::make('description')
                    ->label('Mô tả')
                    ->rows(2)
                    ->columnSpanFull(),

                // Dynamic value field based on type
                TextInput::make('value')
                    ->label('Giá trị')
                    ->required()
                    ->visible(fn($get) => in_array($get('type'), ['string', 'integer', 'decimal']))
                    ->numeric(fn($get) => in_array($get('type'), ['integer', 'decimal']))
                    ->columnSpanFull(),

                Toggle::make('boolean_value')
                    ->label('Giá trị')
                    ->visible(fn($get) => $get('type') === 'boolean')
                    ->afterStateUpdated(fn($state, $set) => $set('value', $state ? '1' : '0'))
                    ->columnSpanFull(),

                Textarea::make('json_value')
                    ->label('Giá trị JSON')
                    ->visible(fn($get) => $get('type') === 'json')
                    ->rows(4)
                    ->afterStateUpdated(fn($state, $set) => $set('value', $state))
                    ->columnSpanFull(),

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
            ]);
    }
}
