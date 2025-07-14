<?php

namespace App\Filament\Resources\Referrals\Tables;

use App\Enums\ReferralStatus;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use App\Models\Referral;

class ReferralsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                    
                TextColumn::make('referrer.username')
                    ->label('Người giới thiệu')
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('referred.username')
                    ->label('Người được giới thiệu')
                    ->searchable()
                    ->sortable(),

                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn ($state) => $state instanceof ReferralStatus ? $state->getLabel() : $state)
                    ->colors([
                        'success' => ReferralStatus::ACTIVE->value,
                        'danger' => ReferralStatus::INACTIVE->value,
                        'warning' => ReferralStatus::PENDING->value,
                    ])
                    ->icon(fn ($state) => $state instanceof ReferralStatus ? $state->getIcon() : null)
                    ->sortable(),
                    
                TextColumn::make('total_points_earned')
                    ->label('Tổng C')
                    ->formatStateUsing(fn ($state) => number_format($state, 2) . ' C')
                    ->sortable()
                    ->alignEnd(),
                    
                TextColumn::make('successful_transactions')
                    ->label('Giao dịch thành công')
                    ->sortable()
                    ->alignCenter()
                    ->badge()
                    ->color(fn ($state) => $state > 0 ? 'success' : 'gray'),
                    
                TextColumn::make('first_transaction_at')
                    ->label('Lần giao dịch đầu')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->placeholder('Chưa có'),
                    
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options(ReferralStatus::getOptions()),
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
