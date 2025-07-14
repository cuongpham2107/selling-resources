<?php

namespace App\Filament\Resources\Customers\RelationManagers;

use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Select;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use App\Enums\PointTransactionType;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class PointTransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'pointTransactions';
    
    protected static ?string $title = 'Giao dịch điểm';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $transactionCount = $ownerRecord->pointTransactions()->count();
        $totalEarned = $ownerRecord->pointTransactions()
            ->whereIn('type', ['earned', 'referral_bonus'])
            ->sum('amount');
        
        return Tab::make('Giao dịch điểm')
            ->badge($transactionCount)
            ->badgeColor($transactionCount > 0 ? 'warning' : 'gray')
            ->badgeTooltip($transactionCount > 0 ? 
                'Tổng điểm kiếm được: ' . number_format($totalEarned, 0, ',', '.') . ' điểm' : 
                'Chưa có giao dịch điểm'
            )
            ->icon('heroicon-m-star');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('type')
                    ->label('Loại giao dịch')
                    ->helperText('Chọn loại giao dịch điểm phù hợp')
                    ->options([
                        'earned' => 'Kiếm được từ giao dịch',
                        'referral_bonus' => 'Thưởng giới thiệu',
                        'sent' => 'Gửi cho người khác',
                        'received' => 'Nhận từ người khác',
                        'exchanged' => 'Đổi thành tiền/hàng',
                        'spend' => 'Tiêu dùng',
                        'transfer' => 'Chuyển điểm',
                        'admin_adjust' => 'Điều chỉnh bởi admin',
                    ])
                    ->required(),
                
                TextInput::make('amount')
                    ->label('Số điểm')
                    ->helperText('Nhập số điểm cho giao dịch (chỉ nhập số dương)')
                    ->required()
                    ->numeric()
                    ->minValue(1)
                    ->suffix('điểm'),
                
                TextInput::make('balance_after')
                    ->label('Số dư sau giao dịch')
                    ->helperText('Số dư điểm còn lại sau khi thực hiện giao dịch')
                    ->numeric()
                    ->required()
                    ->minValue(0)
                    ->suffix('điểm'),
                
                Select::make('related_customer_id')
                    ->label('Người được giới thiệu')
                    ->helperText('Người mà khách hàng này đã giới thiệu (chỉ áp dụng cho thưởng giới thiệu)')
                    ->relationship('relatedCustomer', 'username')
                    ->searchable()
                    ->preload()
                    ->nullable(),
                
                Textarea::make('description')
                    ->label('Mô tả giao dịch')
                    ->helperText('Mô tả chi tiết về giao dịch điểm này (tùy chọn)')
                    ->placeholder('Ví dụ: Thưởng giới thiệu khi khách hàng ABC hoàn thành giao dịch đầu tiên...')
                    ->rows(3)
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                BadgeColumn::make('type')
                    ->label('Loại giao dịch')
                    ->formatStateUsing(fn ($state): string => match ($state instanceof \App\Enums\PointTransactionType ? $state->value : $state) {
                        'earned' => 'Kiếm được từ giao dịch',
                        'referral_bonus' => 'Thưởng giới thiệu',
                        'sent' => 'Gửi cho người khác',
                        'received' => 'Nhận từ người khác',
                        'exchanged' => 'Đổi thành tiền/hàng',
                        'spend' => 'Tiêu dùng',
                        'transfer' => 'Chuyển điểm',
                        'admin_adjust' => 'Điều chỉnh bởi admin',
                        default => $state instanceof \App\Enums\PointTransactionType ? $state->value : $state,
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
                        $typeValue = $record->type instanceof \App\Enums\PointTransactionType ? $record->type->value : $record->type;
                        $prefix = in_array($typeValue, ['sent', 'spend', 'exchanged', 'transfer']) ? '-' : '+';
                        return $prefix . number_format($state, 0, ',', '.') . ' điểm';
                    })
                    ->color(function ($record) {
                        $typeValue = $record->type instanceof \App\Enums\PointTransactionType ? $record->type->value : $record->type;
                        return in_array($typeValue, ['sent', 'spend', 'exchanged', 'transfer']) ? 'danger' : 'success';
                    })
                    ->sortable(),
                
                TextColumn::make('balance_after')
                    ->label('Số dư sau')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' điểm')
                    ->sortable(),
                
                TextColumn::make('relatedCustomer.username')
                    ->label('Người được giới thiệu')
                    ->placeholder('N/A')
                    ->searchable()
                    ->toggleable(),
                
                TextColumn::make('description')
                    ->label('Mô tả giao dịch')
                    ->limit(30)
                    ->placeholder('Không có mô tả')
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= $column->getCharacterLimit()) {
                            return null;
                        }
                        return $state;
                    }),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
                AssociateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DissociateAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DissociateBulkAction::make(),
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
