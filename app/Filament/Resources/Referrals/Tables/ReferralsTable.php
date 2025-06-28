<?php

namespace App\Filament\Resources\Referrals\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ReferralsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                    
                TextColumn::make('referrer.username')
                    ->label('Người giới thiệu')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('referred.username')
                    ->label('Người được giới thiệu')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('total_points_earned')
                    ->label('Tổng C')
                    ->formatStateUsing(fn ($state) => number_format($state) . ' C')
                    ->sortable(),
                    
                TextColumn::make('successful_transactions')
                    ->label('Giao dịch thành công')
                    ->sortable(),
                    
                TextColumn::make('first_transaction_at')
                    ->label('Lần giao dịch đầu')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('Chưa có'),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                //
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
