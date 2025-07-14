<?php

namespace App\Filament\Resources\Customers\RelationManagers;

use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\DateTimePicker;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use App\Enums\IntermediateTransactionStatus;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;
use Filament\Tables\Table;

class SellerTransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'sellerTransactions';

    protected static ?string $title = 'Giao dịch bán';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $transactionCount = $ownerRecord->sellerTransactions()->count();
        $totalEarned = $ownerRecord->sellerTransactions()
            ->where('status', 'completed')
            ->sum('amount');
        
        return Tab::make('Giao dịch bán')
            ->badge($transactionCount)
            ->badgeColor($transactionCount > 0 ? 'primary' : 'gray')
            ->badgeTooltip($transactionCount > 0 ? 
                "Đã kiếm được: " . number_format($totalEarned, 0, ',', '.') . " VNĐ" : 
                'Chưa có giao dịch bán'
            )
            ->icon('heroicon-m-currency-dollar');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->disabled()
                    ->dehydrated(false),
                
                TextInput::make('amount')
                    ->label('Số tiền')
                    ->required()
                    ->numeric()
                    ->prefix('VNĐ'),
                
                Textarea::make('description')
                    ->label('Mô tả')
                    ->required()
                    ->columnSpanFull(),
                
                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Đang chờ',
                        'confirmed' => 'Đã xác nhận',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                    ])
                    ->required(),
                
                TextInput::make('duration_hours')
                    ->label('Thời hạn (giờ)')
                    ->numeric()
                    ->default(24),
                
                DateTimePicker::make('expires_at')
                    ->label('Hết hạn lúc'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('transaction_code')
            ->columns([
                TextColumn::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->searchable()
                    ->copyable()
                    ->tooltip('Nhấp để sao chép'),
                
                TextColumn::make('buyer.username')
                    ->label('Người mua')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('fee')
                    ->label('Phí')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn ($state): string => match ($state instanceof \App\Enums\IntermediateTransactionStatus ? $state->value : $state) {
                        'pending' => 'Đang chờ',
                        'confirmed' => 'Đã xác nhận',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                        default => $state instanceof \App\Enums\IntermediateTransactionStatus ? $state->value : $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'success' => 'completed',
                        'danger' => 'cancelled',
                        'info' => 'confirmed',
                    ]),
                
                TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(30)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= $column->getCharacterLimit()) {
                            return null;
                        }
                        return $state;
                    }),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
                
                TextColumn::make('expires_at')
                    ->label('Hết hạn')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
                AssociateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DissociateAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DissociateBulkAction::make(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
