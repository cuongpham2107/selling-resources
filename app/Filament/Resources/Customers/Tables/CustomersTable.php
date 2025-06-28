<?php

namespace App\Filament\Resources\Customers\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class CustomersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('username')
                    ->label('Tên đăng nhập')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('phone')
                    ->label('Số điện thoại')
                    ->searchable(),
                
                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean()
                    ->sortable(),
                
                TextColumn::make('referral_code')
                    ->label('Mã giới thiệu')
                    ->searchable()
                    ->copyable()
                    ->tooltip('Click để copy'),
                
                TextColumn::make('referrer.username')
                    ->label('Người giới thiệu')
                    ->searchable()
                    ->sortable(),
                
                IconColumn::make('kyc_verified_at')
                    ->label('KYC')
                    ->boolean()
                    ->getStateUsing(fn ($record) => !is_null($record->kyc_verified_at))
                    ->sortable(),
                
                TextColumn::make('balance.balance')
                    ->label('Số dư')
                    ->formatStateUsing(fn ($state) => number_format($state ?? 0, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('points.points')
                    ->label('C')
                    ->formatStateUsing(fn ($state) => number_format($state ?? 0, 0, ',', '.') . ' C')
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                TernaryFilter::make('is_active')
                    ->label('Hoạt động')
                    ->placeholder('Tất cả')
                    ->trueLabel('Hoạt động')
                    ->falseLabel('Không hoạt động'),
                
                TernaryFilter::make('kyc_verified')
                    ->label('KYC')
                    ->placeholder('Tất cả')
                    ->trueLabel('Đã xác thực')
                    ->falseLabel('Chưa xác thực')
                    ->queries(
                        true: fn ($query) => $query->whereNotNull('kyc_verified_at'),
                        false: fn ($query) => $query->whereNull('kyc_verified_at'),
                    ),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
