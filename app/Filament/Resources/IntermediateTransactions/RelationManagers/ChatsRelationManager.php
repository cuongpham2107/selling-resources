<?php

namespace App\Filament\Resources\IntermediateTransactions\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class ChatsRelationManager extends RelationManager
{
    protected static string $relationship = 'chats';
    
    protected static ?string $title = 'Tin nhắn giao dịch';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $chatCount = $ownerRecord->chats()->count();
        $latestChat = $ownerRecord->chats()->latest()->first();
        
        return Tab::make('Tin nhắn')
            ->badge($chatCount)
            ->badgeColor($chatCount > 0 ? 'success' : 'gray')
            ->badgeTooltip($chatCount > 0 ? 
                'Tin nhắn mới nhất: ' . ($latestChat ? $latestChat->created_at->diffForHumans() : 'N/A') : 
                'Chưa có tin nhắn'
            )
            ->icon('heroicon-m-chat-bubble-left-right');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('sender_id')
                    ->label('Người gửi')
                    ->helperText('Chọn người gửi tin nhắn (buyer hoặc seller)')
                    ->options(function (RelationManager $livewire) {
                        $record = $livewire->getOwnerRecord();
                        return [
                            $record->buyer_id => $record->buyer->username . ' (Người mua)',
                            $record->seller_id => $record->seller->username . ' (Người bán)',
                        ];
                    })
                    ->required(),
                    
                Textarea::make('message')
                    ->label('Nội dung tin nhắn')
                    ->helperText('Nhập nội dung tin nhắn (tối đa 1000 ký tự)')
                    ->required()
                    ->maxLength(1000)
                    ->rows(4)
                    ->columnSpanFull(),
                    
                FileUpload::make('images')
                    ->label('Hình ảnh đính kèm')
                    ->helperText('Tải lên tối đa 3 hình ảnh (jpg, png, gif)')
                    ->image()
                    ->multiple()
                    ->maxFiles(3)
                    ->maxSize(5120) // 5MB
                    ->acceptedFileTypes(['image/jpeg', 'image/png', 'image/gif'])
                    ->directory('transaction-chats/images')
                    ->columnSpanFull(),
                    
                FileUpload::make('files')
                    ->label('Tệp đính kèm')
                    ->helperText('Tải lên tối đa 2 tệp (pdf, doc, txt)')
                    ->multiple()
                    ->maxFiles(2)
                    ->maxSize(10240) // 10MB
                    ->acceptedFileTypes(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'])
                    ->directory('transaction-chats/files')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('message')
            ->columns([
                TextColumn::make('sender.username')
                    ->label('Người gửi')
                    ->formatStateUsing(function ($state, $record) {
                        $ownerRecord = $this->getOwnerRecord();
                        $role = '';
                        if ($record->sender_id === $ownerRecord->buyer_id) {
                            $role = ' (Người mua)';
                        } elseif ($record->sender_id === $ownerRecord->seller_id) {
                            $role = ' (Người bán)';
                        }
                        return $state . $role;
                    })
                    ->searchable()
                    ->sortable(),
                    
                TextColumn::make('message')
                    ->label('Nội dung')
                    ->limit(50)
                    ->searchable()
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= $column->getCharacterLimit()) {
                            return null;
                        }
                        return $state;
                    }),
                    
                BadgeColumn::make('attachments')
                    ->label('Đính kèm')
                    ->formatStateUsing(function ($state, $record) {
                        $imageCount = count($record->images ?? []);
                        $fileCount = count($record->files ?? []);
                        $total = $imageCount + $fileCount;
                        
                        if ($total === 0) {
                            return null; // Không hiển thị gì nếu không có attachment
                        }
                        
                        $parts = [];
                        if ($imageCount > 0) {
                            $parts[] = $imageCount . ' ảnh';
                        }
                        if ($fileCount > 0) {
                            $parts[] = $fileCount . ' tệp';
                        }
                        
                        return implode(', ', $parts);
                    })
                    ->colors([
                        'success' => fn ($record) => $record->hasAttachments(),
                    ])
                    ->icon(fn ($record) => $record->hasAttachments() ? 'heroicon-m-paper-clip' : null)
                    ->placeholder(''),
                    
                TextColumn::make('created_at')
                    ->label('Thời gian gửi')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('sender_id')
                    ->label('Người gửi')
                    ->options(function (RelationManager $livewire) {
                        $record = $livewire->getOwnerRecord();
                        return [
                            $record->buyer_id => $record->buyer->username . ' (Người mua)',
                            $record->seller_id => $record->seller->username . ' (Người bán)',
                        ];
                    }),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Gửi tin nhắn mới')
                    ->icon('heroicon-m-plus')
                    ->mutateFormDataUsing(function (array $data, RelationManager $livewire): array {
                        $data['transaction_type'] = 'intermediate';
                        $data['transaction_id'] = $livewire->getOwnerRecord()->id;
                        return $data;
                    }),
            ])
            ->actions([
                EditAction::make()
                    ->label('Chỉnh sửa'),
                DeleteAction::make()
                    ->label('Xóa'),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make()
                        ->label('Xóa đã chọn'),
                ]),
            ])
            ->defaultSort('created_at', 'desc')
            ->striped()
            ->emptyStateHeading('Chưa có tin nhắn nào')
            ->emptyStateDescription('Bắt đầu cuộc trò chuyện bằng cách gửi tin nhắn đầu tiên.')
            ->emptyStateIcon('heroicon-o-chat-bubble-left-right');
    }
}
