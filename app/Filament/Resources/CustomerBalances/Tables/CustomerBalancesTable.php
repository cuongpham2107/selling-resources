<?php

namespace App\Filament\Resources\CustomerBalances\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CustomerBalancesTable
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
                    
                TextColumn::make('balance')
                    ->label('Số dư')
                    ->money('VND')
                    ->sortable(),
                    
                TextColumn::make('locked_balance')
                    ->label('Số dư bị khóa')
                    ->money('VND')
                    ->sortable(),
                    
                TextColumn::make('available_balance')
                    ->label('Số dư khả dụng')
                    ->formatStateUsing(function ($record) {
                        $available = $record->balance - $record->locked_balance;
                        return number_format($available) . ' VNĐ';
                    })
                    ->sortable(),
                    
                TextColumn::make('updated_at')
                    ->label('Cập nhật cuối')
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
            ->defaultSort('updated_at', 'desc')
            ->striped();
    }
}
