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
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class TopupsRelationManager extends RelationManager
{
    protected static string $relationship = 'topups';
    
    protected static ?string $title = 'Nạp tiền';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $topupCount = $ownerRecord->topups()->count();
        $totalTopups = $ownerRecord->topups()
            ->where('status', 'completed')
            ->sum('amount');
        
        return Tab::make('Nạp tiền')
            ->badge($topupCount)
            ->badgeColor($topupCount > 0 ? 'success' : 'gray')
            ->badgeTooltip($topupCount > 0 ? 
                'Tổng đã nạp: ' . number_format($totalTopups, 0, ',', '.') . ' VNĐ' : 
                'Chưa có giao dịch nạp tiền'
            )
            ->icon('heroicon-m-arrow-down-circle');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('amount')
                    ->label('Số tiền')
                    ->required()
                    ->numeric()
                    ->prefix('VNĐ'),
                
                Select::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->options([
                        'vnpay' => 'VNPay',
                        'bank_transfer' => 'Chuyển khoản ngân hàng',
                        'cash' => 'Tiền mặt',
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
                    ->tooltip('Nhấp để sao chép'),
                
                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('fee')
                    ->label('Phí')
                    ->formatStateUsing(fn ($state) => number_format($state ?? 0, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('net_amount')
                    ->label('Số tiền thực nhận')
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
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'processing',
                        'success' => 'completed',
                        'danger' => ['failed', 'cancelled'],
                    ]),
                
                TextColumn::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'vnpay' => 'VNPay',
                        'bank_transfer' => 'Chuyển khoản ngân hàng',
                        'cash' => 'Tiền mặt',
                        default => ucfirst($state),
                    }),
                
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
