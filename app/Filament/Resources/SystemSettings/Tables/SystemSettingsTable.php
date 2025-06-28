<?php

namespace App\Filament\Resources\SystemSettings\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class SystemSettingsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('key')
                    ->label('Khóa cài đặt')
                    ->searchable()
                    ->sortable()
                    ->weight('medium')
                    ->copyable(),

                BadgeColumn::make('type')
                    ->label('Kiểu dữ liệu')
                    ->colors([
                        'info' => 'string',
                        'success' => 'integer',
                        'warning' => 'decimal',
                        'danger' => 'boolean',
                        'gray' => 'json',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'string' => 'Chuỗi',
                        'integer' => 'Số nguyên',
                        'decimal' => 'Số thập phân',
                        'boolean' => 'Đúng/Sai',
                        'json' => 'JSON',
                        default => $state,
                    }),

                TextColumn::make('value')
                    ->label('Giá trị')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->value)
                    ->formatStateUsing(function ($record) {
                        if ($record->type === 'boolean') {
                            return $record->value == '1' ? 'Đúng' : 'Sai';
                        }
                        if ($record->type === 'json') {
                            return 'JSON Data...';
                        }
                        return $record->value;
                    }),

                TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->description)
                    ->placeholder('Không có mô tả'),

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
                SelectFilter::make('type')
                    ->label('Kiểu dữ liệu')
                    ->options([
                        'string' => 'Chuỗi',
                        'integer' => 'Số nguyên',
                        'decimal' => 'Số thập phân',
                        'boolean' => 'Đúng/Sai',
                        'json' => 'JSON',
                    ])
                    ->multiple(),
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
                        ->label('Xóa đã chọn'),
                ]),
            ])
            ->defaultSort('key', 'asc')
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }
}
