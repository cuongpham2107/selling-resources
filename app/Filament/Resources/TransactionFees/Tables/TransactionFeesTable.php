<?php

namespace App\Filament\Resources\TransactionFees\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TransactionFeesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('min_amount')
                    ->label('Số tiền tối thiểu')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                    
                TextColumn::make('max_amount')
                    ->label('Số tiền tối đa')
                    ->formatStateUsing(fn ($state) => $state ? number_format($state, 0, ',', '.') . ' VNĐ' : 'Không giới hạn')
                    ->sortable(),
                    
                TextColumn::make('fee_amount')
                    ->label('Phí cố định')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                    
                TextColumn::make('fee_percentage')
                    ->label('Phí %')
                    ->formatStateUsing(fn ($state) => $state . '%')
                    ->sortable(),
                    
                TextColumn::make('daily_fee_percentage')
                    ->label('Phí hàng ngày')
                    ->formatStateUsing(fn ($state) => $state . '%')
                    ->sortable(),
                    
                TextColumn::make('points_reward')
                    ->label('Thưởng C')
                    ->formatStateUsing(fn ($state) => number_format($state) . ' điểm')
                    ->sortable(),
                    
                IconColumn::make('is_active')
                    ->label('Trạng thái')
                    ->boolean(),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                    
                TextColumn::make('updated_at')
                    ->label('Cập nhật cuối')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
