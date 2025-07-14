<?php

namespace App\Filament\Resources\CustomerPoints\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class CustomerPointsTable
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
                    
                TextColumn::make('points')
                    ->label('Số C')
                    ->formatStateUsing(fn ($state) => number_format($state) . ' điểm')
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
