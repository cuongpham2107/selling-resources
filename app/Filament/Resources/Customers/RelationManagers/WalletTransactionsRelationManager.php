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
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class WalletTransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'walletTransactions';

    protected static ?string $title = 'Giao dịch ví';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $transactionCount = $ownerRecord->walletTransactions()->count();
        $totalDeposits = $ownerRecord->walletTransactions()
            ->where('type', 'deposit')
            ->where('status', 'completed')
            ->sum('amount');
        
        return Tab::make('Giao dịch ví')
            ->badge($transactionCount)
            ->badgeColor($transactionCount > 0 ? 'info' : 'gray')
            ->badgeTooltip($transactionCount > 0 ? 
                "Tổng nạp tiền: " . number_format($totalDeposits, 0, ',', '.') . " VNĐ" : 
                'Không có giao dịch ví'
            )
            ->icon('heroicon-m-wallet');
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
                
                Select::make('type')
                    ->label('Loại giao dịch')
                    ->options([
                        'deposit' => 'Nạp tiền',
                        'withdrawal' => 'Rút tiền',
                        'transfer' => 'Chuyển tiền',
                    ])
                    ->required(),
                
                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                    ])
                    ->required(),
                
                Textarea::make('description')
                    ->label('Mô tả')
                    ->columnSpanFull(),
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
                    ->tooltip('Click để copy'),
                
                TextColumn::make('type')
                    ->label('Loại')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'deposit' => 'Nạp tiền',
                        'withdrawal' => 'Rút tiền',
                        'transfer' => 'Chuyển tiền',
                        default => ucfirst($state),
                    })
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'deposit' => 'success',
                        'withdrawal' => 'warning',
                        'transfer' => 'info',
                        default => 'gray',
                    }),
                
                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Chờ xử lý',
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'failed' => 'Thất bại',
                        'cancelled' => 'Đã hủy',
                        default => ucfirst($state),
                    })
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'processing',
                        'success' => 'completed',
                        'danger' => ['failed', 'cancelled'],
                    ]),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
                
                TextColumn::make('completed_at')
                    ->label('Ngày hoàn thành')
                    ->dateTime()
                    ->placeholder('Chưa hoàn thành')
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
