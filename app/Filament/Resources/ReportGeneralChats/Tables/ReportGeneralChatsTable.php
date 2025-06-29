<?php

namespace App\Filament\Resources\ReportGeneralChats\Tables;

use App\Models\ReportGeneralChat;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class ReportGeneralChatsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable(),
                TextColumn::make('generalChat.message')
                    ->label('Tin nhắn')
                    ->limit(50)
                    ->tooltip(fn ($record) => $record->generalChat->message)
                    ->formatStateUsing(fn ($record) => 
                        $record->generalChat->message . 
                        ($record->generalChat->attachedProduct ? ' [📦 ' . $record->generalChat->attachedProduct->name . ']' : '')
                    )
                    ->searchable(),
                TextColumn::make('generalChat.sender.username')
                    ->label('Người gửi')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('reporter.username')
                    ->label('Người báo cáo')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('reason')
                    ->label('Lý do')
                    ->formatStateUsing(fn ($state) => ReportGeneralChat::getReasons()[$state] ?? $state)
                    ->badge()
                    ->color(fn ($state) => match($state) {
                        'spam' => 'danger',
                        'inappropriate' => 'warning',
                        'harassment' => 'danger',
                        'fraud' => 'danger',
                        'hate_speech' => 'danger',
                        'violence' => 'danger',
                        'personal_info' => 'warning',
                        default => 'gray',
                    }),
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn ($state) => match($state) {
                        'pending' => 'Chờ xử lý',
                        'reviewing' => 'Đang xem xét', 
                        'resolved' => 'Đã xử lý',
                        'rejected' => 'Từ chối',
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'primary' => 'reviewing',
                        'success' => 'resolved',
                        'danger' => 'rejected',
                    ]),
                TextColumn::make('handler.name')
                    ->label('Admin xử lý')
                    ->placeholder('Chưa xử lý')
                    ->sortable(),
                TextColumn::make('created_at')
                    ->label('Ngày báo cáo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
                TextColumn::make('handled_at')
                    ->label('Ngày xử lý')
                    ->dateTime('d/m/Y H:i')
                    ->placeholder('Chưa xử lý')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'reviewing' => 'Đang xem xét',
                        'resolved' => 'Đã xử lý',
                        'rejected' => 'Từ chối',
                    ]),
                SelectFilter::make('reason')
                    ->label('Lý do')
                    ->options(ReportGeneralChat::getReasons()),
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
            ->defaultSort('created_at', 'desc');
    }
}
