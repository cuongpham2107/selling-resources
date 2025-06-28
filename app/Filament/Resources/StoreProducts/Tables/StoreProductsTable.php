<?php

namespace App\Filament\Resources\StoreProducts\Tables;

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

class StoreProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                ImageColumn::make('main_image')
                    ->label('Hình ảnh')
                    ->getStateUsing(fn($record) => $record->main_image)
                    ->size(60)
                    ->square()
                    ->defaultImageUrl(asset('images/placeholder.png')),

                TextColumn::make('name')
                    ->label('Tên sản phẩm')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->limit(30),

                TextColumn::make('store.store_name')
                    ->label('Cửa hàng')
                    ->searchable()
                    ->sortable()
                    ->limit(20)
                    ->description(fn ($record) => $record->store?->owner?->name),

                TextColumn::make('price')
                    ->label('Giá')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable()
                    ->weight('medium')
                    ->alignEnd(),

                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean()
                    ->trueIcon('heroicon-s-check-circle')
                    ->falseIcon('heroicon-s-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                IconColumn::make('is_sold')
                    ->label('Đã bán')
                    ->boolean()
                    ->trueIcon('heroicon-s-check-badge')
                    ->falseIcon('heroicon-s-clock')
                    ->trueColor('warning')
                    ->falseColor('gray'),

                TextColumn::make('sold_at')
                    ->label('Ngày bán')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('Chưa bán')
                    ->toggleable(),

                IconColumn::make('is_deleted')
                    ->label('Đã xóa')
                    ->boolean()
                    ->trueIcon('heroicon-s-trash')
                    ->falseIcon('heroicon-s-document')
                    ->trueColor('danger')
                    ->falseColor('success')
                    ->toggleable(),

                TextColumn::make('deletedBy.name')
                    ->label('Xóa bởi')
                    ->placeholder('N/A')
                    ->toggleable(isToggledHiddenByDefault: true),

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
                SelectFilter::make('store_id')
                    ->label('Cửa hàng')
                    ->relationship('store', 'store_name')
                    ->searchable()
                    ->preload(),

                TernaryFilter::make('is_active')
                    ->label('Trạng thái hoạt động')
                    ->trueLabel('Đang hoạt động')
                    ->falseLabel('Ngừng hoạt động')
                    ->native(false),

                TernaryFilter::make('is_sold')
                    ->label('Trạng thái bán')
                    ->trueLabel('Đã bán')
                    ->falseLabel('Chưa bán')
                    ->native(false),

                TernaryFilter::make('is_deleted')
                    ->label('Trạng thái xóa')
                    ->trueLabel('Đã xóa')
                    ->falseLabel('Chưa xóa')
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
