<?php

namespace App\Filament\Resources\StoreTransactions\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class StoreTransactionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('buyer.username')
                    ->label('Người mua')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->buyer?->email),

                TextColumn::make('seller.username')
                    ->label('Người bán')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->seller?->email),

                TextColumn::make('product.name')
                    ->label('Sản phẩm')
                    ->searchable()
                    ->sortable()
                    ->limit(30),

                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->numeric()
                    ->sortable()
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->alignEnd(),

                TextColumn::make('fee')
                    ->label('Phí')
                    ->numeric()
                    ->sortable()
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->alignEnd()
                    ->color('warning'),

                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->colors([
                        'warning' => 'processing',
                        'success' => 'completed',
                        'danger' => 'cancelled',
                        'info' => 'disputed',
                    ])
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                        default => $state,
                    }),

                IconColumn::make('buyer_early_complete')
                    ->label('Hoàn thành sớm')
                    ->boolean()
                    ->trueColor('success')
                    ->falseColor('gray'),

                TextColumn::make('completed_at')
                    ->label('Hoàn thành lúc')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('Chưa hoàn thành'),

                TextColumn::make('auto_complete_at')
                    ->label('Tự động hoàn thành')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->color('warning'),

                TextColumn::make('created_at')
                    ->label('Tạo lúc')
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
                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'processing' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                    ])
                    ->multiple(),

                SelectFilter::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->options([
                        'balance' => 'Số dư tài khoản',
                        'bank' => 'Chuyển khoản ngân hàng',
                        'momo' => 'Ví MoMo',
                        'zalo_pay' => 'ZaloPay',
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
            ]);
    }
}
