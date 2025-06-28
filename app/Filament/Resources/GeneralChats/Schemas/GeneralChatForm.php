<?php

namespace App\Filament\Resources\GeneralChats\Schemas;

use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class GeneralChatForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->schema([
                Select::make('sender_id')
                    ->label('Người gửi')
                    ->relationship('sender', 'username')
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
                    ])
                    ->columnSpan(1),

                Select::make('attached_product_id')
                    ->label('Sản phẩm đính kèm')
                    ->relationship('attachedProduct', 'name')
                    ->searchable()
                    ->preload()
                    ->columnSpan(1),

                RichEditor::make('message')
                    ->label('Nội dung tin nhắn')
                    ->required()
                    ->columnSpanFull(),

                Toggle::make('is_deleted')
                    ->label('Đã xóa')
                    ->disabled()
                    ->columnSpan(1),

                Select::make('deleted_by')
                    ->label('Xóa bởi')
                    ->relationship('deletedBy', 'name')
                    ->disabled()
                    ->columnSpan(1),

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
