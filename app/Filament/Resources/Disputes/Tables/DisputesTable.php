<?php

namespace App\Filament\Resources\Disputes\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class DisputesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'intermediate' => 'Trung gian',
                        'store' => 'Cửa hàng',
                        default => $state,
                    })
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'intermediate' => 'info',
                        'store' => 'warning',
                        default => 'gray',
                    }),

                TextColumn::make('transaction_id')
                    ->label('ID giao dịch')
                    ->numeric()
                    ->sortable()
                    ->searchable(),

                TextColumn::make('creator.username')
                    ->label('Người tạo')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->creator?->email),

                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'investigating',
                        'success' => 'resolved',
                        'gray' => 'closed',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Đang chờ',
                        'investigating' => 'Đang điều tra',
                        'resolved' => 'Đã giải quyết',
                        'closed' => 'Đã đóng',
                        default => $state,
                    }),

                TextColumn::make('assignedTo.name')
                    ->label('Được phân công')
                    ->placeholder('Chưa phân công')
                    ->sortable(),

                TextColumn::make('result')
                    ->label('Kết quả')
                    ->formatStateUsing(fn (?string $state): string => match ($state) {
                        'buyer_favor' => 'Thiên về người mua',
                        'seller_favor' => 'Thiên về người bán',
                        'partial_refund' => 'Hoàn tiền một phần',
                        'no_action' => 'Không hành động',
                        default => $state ?? 'Chưa có',
                    })
                    ->badge()
                    ->color(fn (?string $state): string => match ($state) {
                        'buyer_favor' => 'success',
                        'seller_favor' => 'danger',
                        'partial_refund' => 'warning',
                        'no_action' => 'gray',
                        default => 'gray',
                    }),

                TextColumn::make('resolved_at')
                    ->label('Ngày giải quyết')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('Chưa giải quyết'),

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
                SelectFilter::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->options([
                        'intermediate' => 'Giao dịch trung gian',
                        'store' => 'Giao dịch cửa hàng',
                    ]),

                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Đang chờ',
                        'investigating' => 'Đang điều tra',
                        'resolved' => 'Đã giải quyết',
                        'closed' => 'Đã đóng',
                    ])
                    ->multiple(),

                SelectFilter::make('assigned_to')
                    ->label('Được phân công')
                    ->relationship('assignedTo', 'name')
                    ->searchable()
                    ->preload(),

                SelectFilter::make('result')
                    ->label('Kết quả')
                    ->options([
                        'buyer_favor' => 'Thiên về người mua',
                        'seller_favor' => 'Thiên về người bán',
                        'partial_refund' => 'Hoàn tiền một phần',
                        'no_action' => 'Không hành động',
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
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }
}
