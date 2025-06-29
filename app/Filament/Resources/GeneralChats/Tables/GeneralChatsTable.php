<?php

namespace App\Filament\Resources\GeneralChats\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Actions\Action;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Facades\Auth;

class GeneralChatsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('sender.username')
                    ->label('Người gửi')
                    ->searchable()
                    ->sortable()
                    ->description(fn ($record) => $record->sender?->email),

                TextColumn::make('message')
                    ->label('Tin nhắn')
                    ->html()
                    ->limit(100)
                    ->tooltip(fn ($record) => strip_tags($record->message))
                    ->searchable(),

                TextColumn::make('attachedProduct.name')
                    ->label('Sản phẩm')
                    ->searchable()
                    ->sortable()
                    ->placeholder('Không có')
                    ->limit(30),

                IconColumn::make('is_deleted')
                    ->label('Đã xóa')
                    ->boolean()
                    ->trueIcon('heroicon-s-trash')
                    ->falseIcon('heroicon-s-document')
                    ->trueColor('danger')
                    ->falseColor('success'),

                TextColumn::make('deletedBy.name')
                    ->label('Xóa bởi')
                    ->placeholder('N/A')
                    ->sortable(),

                TextColumn::make('deleted_at')
                    ->label('Ngày xóa')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
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
                SelectFilter::make('sender_id')
                    ->label('Người gửi')
                    ->relationship('sender', 'username')
                    ->searchable()
                    ->preload(),

                TernaryFilter::make('is_deleted')
                    ->label('Trạng thái')
                    ->trueLabel('Đã xóa')
                    ->falseLabel('Chưa xóa')
                    ->native(false),

                SelectFilter::make('deleted_by')
                    ->label('Xóa bởi')
                    ->relationship('deletedBy', 'name')
                    ->searchable()
                    ->preload(),
            ])
            ->recordActions([
                ViewAction::make()
                    ->label('Xem'),
                EditAction::make()
                    ->label('Sửa'),
                Action::make('toggle_delete_status')
                    ->label(fn ($record) => $record->is_deleted ? 'Khôi phục' : 'Xóa tin nhắn')
                    ->icon(fn ($record) => $record->is_deleted ? 'heroicon-o-arrow-path' : 'heroicon-o-trash')
                    ->color(fn ($record) => $record->is_deleted ? 'success' : 'danger')
                    ->requiresConfirmation()
                    ->modalHeading(fn ($record) => $record->is_deleted ? 'Khôi phục tin nhắn' : 'Xóa tin nhắn')
                    ->modalDescription(fn ($record) => $record->is_deleted 
                        ? 'Bạn có chắc chắn muốn khôi phục tin nhắn này không?' 
                        : 'Bạn có chắc chắn muốn xóa tin nhắn này không? Tin nhắn sẽ được đánh dấu là đã xóa.')
                    ->action(function ($record) {
                        if ($record->is_deleted) {
                            // Khôi phục tin nhắn
                            $record->restore();
                        } else {
                            // Xóa tin nhắn (soft delete)
                            $record->markAsDeleted(Auth::user());
                        }
                    })
                    ->successNotificationTitle(fn ($record) => $record->is_deleted 
                        ? 'Tin nhắn đã được xóa thành công!' 
                        : 'Tin nhắn đã được khôi phục thành công!')
                    ->visible(fn ($record) => Auth::user()->can('manage_chats') || Auth::user()->hasRole('super_admin')),
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
