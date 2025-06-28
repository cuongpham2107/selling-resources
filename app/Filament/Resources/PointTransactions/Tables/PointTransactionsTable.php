<?php

namespace App\Filament\Resources\PointTransactions\Tables;

use App\Enums\PointTransactionType;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PointTransactionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                    
                TextColumn::make('customer.username')
                    ->label('Khách hàng')
                    ->searchable()
                    ->sortable(),
                    
                BadgeColumn::make('type')
                    ->label('Loại')
                    ->formatStateUsing(fn ($state) => $state instanceof PointTransactionType ? $state->getLabel() : $state)
                    ->colors([
                        'success' => [PointTransactionType::EARNED->value, PointTransactionType::EARN->value],
                        'danger' => [PointTransactionType::SENT->value, PointTransactionType::SPEND->value], 
                        'warning' => PointTransactionType::REFERRAL_BONUS->value,
                        'primary' => [PointTransactionType::RECEIVED->value, PointTransactionType::TRANSFER->value],
                        'secondary' => PointTransactionType::EXCHANGED->value,
                        'info' => PointTransactionType::ADMIN_ADJUST->value,
                    ]),
                    
                TextColumn::make('amount')
                    ->label('Số C')
                    ->formatStateUsing(function ($state, $record) {
                        $type = $record->type instanceof PointTransactionType ? $record->type : PointTransactionType::from($record->type);
                        $prefix = $type->isIncreasing() ? '+' : '-';
                        return $prefix . number_format($state) . ' C';
                    })
                    ->sortable(),
                    
                TextColumn::make('balance_after')
                    ->label('Số dư sau')
                    ->formatStateUsing(fn ($state) => number_format($state) . ' C')
                    ->sortable(),
                    
                TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(50)
                    ->toggleable(),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Loại giao dịch')
                    ->options(PointTransactionType::getOptions()),
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
