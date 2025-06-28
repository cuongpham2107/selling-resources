<?php

namespace App\Filament\Resources\Disputes\Schemas;

use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Tabs;
use Filament\Schemas\Schema;

class DisputeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->options([
                        'intermediate' => 'Giao dịch trung gian',
                        'store' => 'Giao dịch cửa hàng',
                    ])
                    ->required()
                    ->columnSpan(1),

                TextInput::make('transaction_id')
                    ->label('ID giao dịch')
                    ->required()
                    ->numeric()
                    ->columnSpan(1),

                Select::make('created_by')
                    ->label('Người tạo')
                    ->relationship('creator', 'username')
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

                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Đang chờ',
                        'investigating' => 'Đang điều tra',
                        'resolved' => 'Đã giải quyết',
                        'closed' => 'Đã đóng',
                    ])
                    ->default('pending')
                    ->required()
                    ->columnSpan(1),

                Textarea::make('reason')
                    ->label('Lý do tranh chấp')
                    ->required()
                    ->rows(3)
                    ->columnSpanFull(),

                RichEditor::make('evidence')
                    ->label('Bằng chứng')
                    ->columnSpanFull(),

                FileUpload::make('evidence_files')
                    ->label('File bằng chứng')
                    ->multiple()
                    ->maxFiles(10)
                    ->directory('dispute-evidence')
                    ->columnSpanFull(),

                // Admin fields
                Select::make('assigned_to')
                    ->label('Phân công cho')
                    ->relationship('assignedTo', 'name')
                    ->searchable()
                    ->preload()
                    ->columnSpan(1),

                Select::make('result')
                    ->label('Kết quả')
                    ->options([
                        'buyer_favor' => 'Thiên về người mua',
                        'seller_favor' => 'Thiên về người bán',
                        'partial_refund' => 'Hoàn tiền một phần',
                        'no_action' => 'Không hành động',
                    ])
                    ->columnSpan(1),

                RichEditor::make('admin_notes')
                    ->label('Ghi chú quản trị')
                    ->columnSpanFull(),

                DateTimePicker::make('resolved_at')
                    ->label('Ngày giải quyết')
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
