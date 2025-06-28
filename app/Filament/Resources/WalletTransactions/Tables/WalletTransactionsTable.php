<?php

namespace App\Filament\Resources\WalletTransactions\Tables;

use App\Enums\PaymentMethod;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\CustomerBalance;
use App\Models\WalletTransaction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Actions\Action;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Table;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\Filter;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Textarea;
use Filament\Support\Colors\Color;
use Illuminate\Database\Eloquent\Builder;

class WalletTransactionsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('transaction_code')
                    ->label('Mã giao dịch')
                    ->searchable()
                    ->sortable()
                    ->copyable()
                    ->copyMessage('Mã giao dịch đã được sao chép!')
                    ->copyMessageDuration(1500),
                    
                TextColumn::make('customer.username')
                    ->label('Khách hàng')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('type')
                    ->label('Loại giao dịch')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => WalletTransactionType::from($state)->label())
                    ->color(fn (string $state): string => match ($state) {
                        'deposit' => 'primary',
                        'withdrawal' => 'danger',
                        'transfer_out' => 'warning',
                        'transfer_in' => 'success',
                        default => 'gray',
                    }),
                    
                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->money('VND')
                    ->sortable(),
                    
                TextColumn::make('fee')
                    ->label('Phí')
                    ->money('VND')
                    ->sortable()
                    ->toggleable(),
                    
                TextColumn::make('net_amount')
                    ->label('Số tiền thực nhận')
                    ->money('VND')
                    ->sortable(),
                    
                TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->formatStateUsing(fn (string $state): string => WalletTransactionStatus::from($state)->label())
                    ->color(fn (string $state): string => WalletTransactionStatus::from($state)->color()),
                    
                TextColumn::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->badge()
                    ->formatStateUsing(fn (?string $state): ?string => $state ? PaymentMethod::from($state)->label() : null)
                    ->searchable()
                    ->toggleable(),
                    
                TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= 50) {
                            return null;
                        }
                        return $state;
                    })
                    ->toggleable(),
                    
                TextColumn::make('vnpay_response_code')
                    ->label('Mã VNPay')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        '00' => 'success',
                        default => 'danger',
                    })
                    ->toggleable()
                    ->visible(function ($record) {
                        return $record && $record->payment_method === 'vnpay';
                    }),
                    
                TextColumn::make('recipient.username')
                    ->label('Người nhận')
                    ->searchable()
                    ->toggleable()
                    ->visible(function ($record) {
                        return $record && in_array($record->type, ['transfer_out', 'transfer_in']);
                    }),
                    
                TextColumn::make('created_at')
                    ->label('Thời gian tạo')
                    ->dateTime('M j, Y H:i')
                    ->sortable(),
                    
                TextColumn::make('completed_at')
                    ->label('Thời gian hoàn thành')
                    ->dateTime('M j, Y H:i')
                    ->sortable()
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('type')
                    ->label('Loại giao dịch')
                    ->options(WalletTransactionType::options()),
                    
                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options(WalletTransactionStatus::options()),
                    
                SelectFilter::make('payment_method')
                    ->label('Phương thức thanh toán')
                    ->options(PaymentMethod::options()),
                    
                Filter::make('created_at')
                    ->label('Thời gian tạo')
                    ->form([
                        DatePicker::make('created_from')
                            ->label('Từ ngày'),
                        DatePicker::make('created_until')
                            ->label('Đến ngày'),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                $data['created_from'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '>=', $date),
                            )
                            ->when(
                                $data['created_until'],
                                fn (Builder $query, $date): Builder => $query->whereDate('created_at', '<=', $date),
                            );
                    }),
            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Xem')
                    ->modalContent(fn (WalletTransaction $record): string => view('filament.resources.wallet-transaction.view', compact('record'))->render()),
                    
                EditAction::make()
                    ->label('Sửa')
                    ->visible(fn (WalletTransaction $record): bool => in_array($record->status, ['pending', 'processing'])),
                    
                Action::make('approve')
                    ->label('Phê duyệt')
                    ->icon('heroicon-s-check')
                    ->color('success')
                    ->visible(fn (WalletTransaction $record): bool => $record->status === 'pending' && $record->type === 'withdrawal')
                    ->requiresConfirmation()
                    ->modalHeading('Phê duyệt rút tiền')
                    ->modalDescription('Bạn có chắc chắn muốn phê duyệt yêu cầu rút tiền này?')
                    ->action(function (WalletTransaction $record): void {
                        $record->update([
                            'status' => 'completed',
                            'completed_at' => now(),
                        ]);
                        
                        // Note: Balance was already deducted when withdrawal was created
                        // No need to modify balance here
                    }),
                    
                Action::make('reject')
                    ->label('Từ chối')
                    ->icon('heroicon-s-x-mark')
                    ->color('danger')
                    ->visible(fn (WalletTransaction $record): bool => $record->status === 'pending' && $record->type === 'withdrawal')
                    ->requiresConfirmation()
                    ->modalHeading('Từ chối rút tiền')
                    ->modalDescription('Bạn có chắc chắn muốn từ chối yêu cầu rút tiền này?')
                    ->form([
                        Textarea::make('rejection_reason')
                            ->label('Lý do từ chối')
                            ->required()
                            ->maxLength(500),
                    ])
                    ->action(function (WalletTransaction $record, array $data): void {
                        $record->update([
                            'status' => 'failed',
                            'description' => $record->description . ' - Từ chối: ' . $data['rejection_reason'],
                        ]);
                        
                        // Refund the amount back to customer balance
                        $balance = CustomerBalance::where('customer_id', $record->customer_id)->first();
                        if ($balance) {
                            $balance->increment('balance', $record->amount);
                        }
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => true), // Remove permission check for now
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->paginated([10, 25, 50, 100]);
    }
}
