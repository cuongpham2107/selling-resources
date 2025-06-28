<?php

namespace App\Filament\Resources\TransactionChats\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class TransactionChatsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                    
                TextColumn::make('transaction_id')
                    ->label('ID giao dịch')
                    ->sortable(),
                    
                TextColumn::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->formatStateUsing(function ($state) {
                        return match($state) {
                            'intermediate' => 'Trung gian',
                            'store' => 'Cửa hàng',
                            default => $state,
                        };
                    }),
                    
                TextColumn::make('sender.username')
                    ->label('Người gửi')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('message')
                    ->label('Tin nhắn')
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        return strlen($state) > 50 ? $state : null;
                    }),
                    
                IconColumn::make('has_images')
                    ->label('Có hình ảnh')
                    ->boolean()
                    ->getStateUsing(fn ($record) => !empty($record->images)),
                    
                TextColumn::make('created_at')
                    ->label('Ngày gửi')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->options([
                        'intermediate' => 'Trung gian',
                        'store' => 'Cửa hàng',
                    ]),
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
