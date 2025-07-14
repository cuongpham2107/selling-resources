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
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class BuyerTransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'buyerTransactions';
    
    protected static ?string $title = 'Giao dịch mua';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->required()
                    ->maxLength(255),
                
                Textarea::make('description')
                    ->label('Mô tả')
                    ->required(),
                
                TextInput::make('amount')
                    ->label('Số tiền')
                    ->required()
                    ->numeric()
                    ->prefix('VNĐ'),
                
                TextInput::make('fee')
                    ->label('Phí')
                    ->required()
                    ->numeric()
                    ->prefix('VNĐ'),
                
                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Đang chờ',
                        'confirmed' => 'Đã xác nhận',
                        'seller_sent' => 'Người bán đã gửi',
                        'buyer_received' => 'Người mua đã nhận',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                    ])
                    ->required(),
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
                    ->sortable(),
                
                TextColumn::make('seller.username')
                    ->label('Người bán')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->money('VND')
                    ->sortable(),
                
                TextColumn::make('fee')
                    ->label('Phí')
                    ->money('VND')
                    ->sortable(),
                
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Đang chờ',
                        'confirmed' => 'Đã xác nhận',
                        'seller_sent' => 'Người bán đã gửi',
                        'buyer_received' => 'Người mua đã nhận',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'primary' => 'confirmed',
                        'info' => 'seller_sent',
                        'secondary' => 'buyer_received',
                        'success' => 'completed',
                        'danger' => ['cancelled', 'disputed'],
                    ]),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
    
    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $transactionCount = $ownerRecord->buyerTransactions()->count();
        $totalAmount = $ownerRecord->buyerTransactions()
            ->where('status', 'completed')
            ->sum('amount');
        
        return Tab::make('Giao dịch mua')
            ->badge($transactionCount)
            ->badgeColor($transactionCount > 0 ? 'success' : 'gray')
            ->badgeTooltip($transactionCount > 0 ? 
                'Tổng đã mua: ' . number_format($totalAmount, 0, ',', '.') . ' VNĐ' : 
                'Chưa có giao dịch mua'
            )
            ->icon('heroicon-m-shopping-cart');
    }
}
