<?php

namespace App\Filament\Resources\PointTransactions\Tables;

use App\Enums\PointTransactionType;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class PointTransactionsTable
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
                    
                BadgeColumn::make('type')
                    ->label('Loại giao dịch')
                    ->formatStateUsing(fn ($state) => match ($state instanceof PointTransactionType ? $state->value : $state) {
                        'earned' => 'Kiếm được từ giao dịch',
                        'referral_bonus' => 'Thưởng giới thiệu',
                        'sent' => 'Gửi cho người khác',
                        'received' => 'Nhận từ người khác',
                        'exchanged' => 'Đổi thành tiền/hàng',
                        'spend' => 'Tiêu dùng',
                        'transfer' => 'Chuyển điểm',
                        'admin_adjust' => 'Điều chỉnh bởi admin',
                        default => $state instanceof PointTransactionType ? $state->value : $state,
                    })
                    ->colors([
                        'success' => ['earned', 'referral_bonus', 'received'],
                        'danger' => ['sent', 'spend', 'exchanged'], 
                        'warning' => 'transfer',
                        'info' => 'admin_adjust',
                    ]),
                    
                TextColumn::make('amount')
                    ->label('Số điểm')
                    ->formatStateUsing(function ($state, $record) {
                        $type = $record->type instanceof PointTransactionType ? $record->type->value : $record->type;
                        $prefix = in_array($type, ['sent', 'spend', 'exchanged', 'transfer']) ? '-' : '+';
                        return $prefix . number_format($state) . ' điểm';
                    })
                    ->sortable(),
                    
                TextColumn::make('balance_after')
                    ->label('Số dư sau')
                    ->formatStateUsing(fn ($state) => number_format($state) . ' điểm')
                    ->sortable(),
                    
                TextColumn::make('relatedCustomer.username')
                    ->label('Người được giới thiệu')
                    ->placeholder('N/A')
                    ->searchable()
                    ->toggleable(),
                    
                TextColumn::make('description')
                    ->label('Mô tả giao dịch')
                    ->limit(50)
                    ->placeholder('Không có mô tả')
                    ->toggleable(),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Loại giao dịch')
                    ->options([
                        'earned' => 'Kiếm được từ giao dịch',
                        'referral_bonus' => 'Thưởng giới thiệu',
                        'sent' => 'Gửi cho người khác',
                        'received' => 'Nhận từ người khác',
                        'exchanged' => 'Đổi thành tiền/hàng',
                        'spend' => 'Tiêu dùng',
                        'transfer' => 'Chuyển điểm',
                        'admin_adjust' => 'Điều chỉnh bởi admin',
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
