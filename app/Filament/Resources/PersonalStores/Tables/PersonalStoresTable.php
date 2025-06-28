<?php

namespace App\Filament\Resources\PersonalStores\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class PersonalStoresTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('avatar')
                    ->disk('public')
                    ->label('Logo')
                    ->circular()
                    ->size(50),

                TextColumn::make('store_name')
                    ->label('Tên cửa hàng')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->limit(25),

                TextColumn::make('owner.username')
                    ->label('Chủ cửa hàng')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->owner?->email),

                TextColumn::make('products_count')
                    ->label('Số sản phẩm')
                    ->counts('products')
                    ->badge()
                    ->color('info'),

                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean()
                    ->trueIcon('heroicon-s-check-circle')
                    ->falseIcon('heroicon-s-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                IconColumn::make('is_locked')
                    ->label('Khóa')
                    ->boolean()
                    ->trueIcon('heroicon-s-lock-closed')
                    ->falseIcon('heroicon-s-lock-open')
                    ->trueColor('danger')
                    ->falseColor('success'),

                TextColumn::make('lockedBy.name')
                    ->label('Khóa bởi')
                    ->placeholder('N/A')
                    ->toggleable(),

                TextColumn::make('locked_at')
                    ->label('Ngày khóa')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('N/A')
                    ->toggleable(),

                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),

                TextColumn::make('updated_at')
                    ->label('Cập nhật')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('owner_id')
                    ->label('Chủ cửa hàng')
                    ->relationship('owner', 'username')
                    ->searchable()
                    ->preload(),

                TernaryFilter::make('is_active')
                    ->label('Trạng thái hoạt động')
                    ->trueLabel('Đang hoạt động')
                    ->falseLabel('Ngừng hoạt động')
                    ->native(false),

                TernaryFilter::make('is_locked')
                    ->label('Trạng thái khóa')
                    ->trueLabel('Đã khóa')
                    ->falseLabel('Chưa khóa')
                    ->native(false),
            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Xem'),
                EditAction::make()
                    ->label('Sửa'),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Xóa được chọn'),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }
}
