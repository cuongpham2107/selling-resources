<?php

namespace App\Filament\Resources\TransactionChats\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class TransactionChatForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin tin nhắn')
                    ->description('Chi tiết tin nhắn trong giao dịch')
                    ->schema([
                        TextInput::make('transaction_id')
                            ->label('ID giao dịch')
                            ->required()
                            ->numeric(),
                            
                        Select::make('transaction_type')
                            ->label('Loại giao dịch')
                            ->options([
                                'intermediate' => 'Giao dịch trung gian',
                                'store' => 'Giao dịch cửa hàng',
                            ])
                            ->required(),
                            
                        Select::make('sender_id')
                            ->label('Người gửi')
                            ->relationship('sender', 'username')
                            ->required()
                            ->searchable()
                            ->preload(),
                    ])
                    ->columns(3),
                    
                Section::make('Nội dung tin nhắn')
                    ->description('Tin nhắn và tệp đính kèm')
                    ->schema([
                        Textarea::make('message')
                            ->label('Tin nhắn')
                            ->required()
                            ->rows(5)
                            ->columnSpanFull(),
                            
                        FileUpload::make('images')
                            ->label('Hình ảnh đính kèm')
                            ->multiple()
                            ->image()
                            ->directory('chat/images')
                            ->maxSize(2048) // 2MB để phù hợp với validation trong controller
                            ->maxFiles(5)
                            ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/jpg', 'image/gif'])
                            ->columnSpanFull(),

                        FileUpload::make('files')
                            ->label('Tệp đính kèm')
                            ->multiple()
                            ->directory('chat/files')
                            ->maxSize(5120) // 5MB để phù hợp với validation trong controller
                            ->maxFiles(3)
                            ->acceptedFileTypes(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'application/zip', 'application/x-rar-compressed'])
                            ->columnSpanFull(),
                    ]),
            ]);
    }
}
