<?php

namespace App\Filament\Resources\ReportGeneralChats\Schemas;

use App\Models\Customer;
use App\Models\GeneralChat;
use App\Models\ReportGeneralChat;
use App\Models\User;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class ReportGeneralChatForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('general_chat_id')
                    ->label('Tin nhắn bị báo cáo')
                    ->relationship('generalChat', 'message')
                    ->getOptionLabelFromRecordUsing(fn (GeneralChat $record) => 
                        substr($record->message, 0, 50) . '... - ' . $record->sender->username . 
                        ($record->attachedProduct ? ' [Sản phẩm: ' . $record->attachedProduct->name . ']' : '')
                    )
                    ->searchable(['message'])
                    ->preload()
                    ->required()
                    ->columnSpanFull(),
                
                Select::make('reporter_id')
                    ->label('Người báo cáo')
                    ->relationship('reporter', 'username')
                    ->getOptionLabelFromRecordUsing(fn (Customer $record) => 
                        $record->username . ' (' . $record->email . ')'
                    )
                    ->searchable(['username', 'email'])
                    ->preload()
                    ->required(),
                
                Select::make('reason')
                    ->label('Lý do báo cáo')
                    ->options(ReportGeneralChat::getReasons())
                    ->required(),
                
                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'reviewing' => 'Đang xem xét',
                        'resolved' => 'Đã xử lý',
                        'rejected' => 'Từ chối',
                    ])
                    ->required()
                    ->default('pending'),
                
                Textarea::make('description')
                    ->label('Mô tả chi tiết')
                    ->placeholder('Mô tả thêm về vi phạm...')
                    ->rows(3)
                    ->columnSpanFull(),
                
                Select::make('handled_by')
                    ->label('Admin xử lý')
                    ->relationship('handler', 'name')
                    ->getOptionLabelFromRecordUsing(fn (User $record) => 
                        $record->name . ' (' . $record->email . ')'
                    )
                    ->searchable(['name', 'email'])
                    ->preload(),
                
                DateTimePicker::make('handled_at')
                    ->label('Thời gian xử lý')
                    ->displayFormat('d/m/Y H:i'),
                
                Textarea::make('admin_note')
                    ->label('Ghi chú của Admin')
                    ->placeholder('Ghi chú về cách xử lý báo cáo này...')
                    ->rows(3)
                    ->columnSpanFull(),
            ]);
    }
}
