<?php

namespace App\Filament\Resources\IntermediateTransactions\Tables;

use App\Enums\IntermediateTransactionStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class IntermediateTransactionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('buyer.username')
                    ->label('Người mua')
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
                    
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn ($state) => $state instanceof IntermediateTransactionStatus ? $state->getLabel() : IntermediateTransactionStatus::from($state)->getLabel())
                    ->colors([
                        'warning' => IntermediateTransactionStatus::PENDING->value,
                        'primary' => IntermediateTransactionStatus::CONFIRMED->value,
                        'info' => IntermediateTransactionStatus::SELLER_SENT->value,
                        'info' => IntermediateTransactionStatus::BUYER_RECEIVED->value,
                        'success' => IntermediateTransactionStatus::COMPLETED->value,
                        'danger' => IntermediateTransactionStatus::DISPUTED->value,
                        'danger' => IntermediateTransactionStatus::CANCELLED->value,
                        'secondary' => IntermediateTransactionStatus::EXPIRED->value,
                    ])
                    ->formatStateUsing(function ($state) {
                        return match($state) {
                            'pending' => 'Chờ xác nhận',
                            'confirmed' => 'Đã xác nhận',
                            'seller_sent' => 'Người bán đã gửi',
                            'buyer_received' => 'Người mua đã nhận',
                            'completed' => 'Hoàn thành',
                            'disputed' => 'Tranh chấp',
                            'cancelled' => 'Đã hủy',
                            'expired' => 'Đã hết hạn',
                            default => $state,
                        };
                    }),
                    
                TextColumn::make('expires_at')
                    ->label('Hết hạn lúc')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options(IntermediateTransactionStatus::getOptions()),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped();
    }
}
