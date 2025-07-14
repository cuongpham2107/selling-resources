<?php

namespace App\Filament\Resources\PersonalStores\RelationManagers;

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
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class TransactionsRelationManager extends RelationManager
{
    protected static string $relationship = 'transactions';
    
    protected static ?string $title = 'Giao dịch cửa hàng';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $transactionsCount = $ownerRecord->transactions()->count();
        $completedTransactions = $ownerRecord->transactions()->where('status', 'completed')->count();
        
        return Tab::make('Giao dịch')
            ->badge($transactionsCount)
            ->badgeColor($transactionsCount > 0 ? 'success' : 'gray')
            ->badgeTooltip("Tổng cộng {$transactionsCount} giao dịch ({$completedTransactions} hoàn thành)")
            ->icon('heroicon-m-banknotes');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin giao dịch')
                    ->schema([
                        Select::make('buyer_id')
                            ->label('Người mua')
                            ->relationship('buyer', 'name')
                            ->required()
                            ->searchable(),

                        Select::make('product_id')
                            ->label('Sản phẩm')
                            ->relationship('product', 'product_name')
                            ->required(),

                        TextInput::make('amount')
                            ->label('Số tiền (VNĐ)')
                            ->required()
                            ->numeric()
                            ->prefix('₫')
                            ->minValue(0),

                        Select::make('status')
                            ->label('Trạng thái')
                            ->options([
                                'pending' => 'Đang chờ',
                                'in_progress' => 'Đang xử lý',
                                'completed' => 'Hoàn thành',
                                'cancelled' => 'Đã hủy',
                                'disputed' => 'Tranh chấp',
                            ])
                            ->required(),

                        Textarea::make('description')
                            ->label('Mô tả')
                            ->maxLength(500)
                            ->rows(3),
                    ]),

                Section::make('Phí và phí giao dịch')
                    ->schema([
                        TextInput::make('fee_amount')
                            ->label('Phí giao dịch (VNĐ)')
                            ->numeric()
                            ->prefix('₫')
                            ->default(0),

                        TextInput::make('seller_receive_amount')
                            ->label('Người bán nhận (VNĐ)')
                            ->numeric()
                            ->prefix('₫'),
                    ])
                    ->columns(2),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('id')
            ->columns([
                TextColumn::make('id')
                    ->label('ID')
                    ->sortable()
                    ->searchable(),

                TextColumn::make('buyer.name')
                    ->label('Người mua')
                    ->searchable()
                    ->sortable(),

                TextColumn::make('product.product_name')
                    ->label('Sản phẩm')
                    ->searchable()
                    ->limit(30),

                TextColumn::make('amount')
                    ->label('Số tiền')
                    ->formatStateUsing(fn ($state): string => number_format($state) . ' VNĐ')
                    ->sortable(),

                TextColumn::make('status')
                    ->label('Trạng thái')
                    ->badge()
                    ->formatStateUsing(function (string $state): string {
                        return match ($state) {
                            'pending' => 'Đang chờ',
                            'in_progress' => 'Đang xử lý',
                            'completed' => 'Hoàn thành',
                            'cancelled' => 'Đã hủy',
                            'disputed' => 'Tranh chấp',
                            default => $state,
                        };
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'pending' => 'warning',
                        'in_progress' => 'info',
                        'completed' => 'success',
                        'cancelled' => 'danger',
                        'disputed' => 'danger',
                        default => 'gray',
                    }),

                TextColumn::make('fee_amount')
                    ->label('Phí')
                    ->formatStateUsing(fn ($state): string => number_format($state) . ' VNĐ')
                    ->sortable(),

                TextColumn::make('seller_receive_amount')
                    ->label('Người bán nhận')
                    ->formatStateUsing(fn ($state): string => number_format($state) . ' VNĐ')
                    ->sortable(),

                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable(),

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
                        'pending' => 'Đang chờ',
                        'in_progress' => 'Đang xử lý',
                        'completed' => 'Hoàn thành',
                        'cancelled' => 'Đã hủy',
                        'disputed' => 'Tranh chấp',
                    ]),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Tạo giao dịch'),
            ])
            ->actions([
                EditAction::make()
                    ->label('Sửa'),
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
            ->emptyStateHeading('Chưa có giao dịch nào')
            ->emptyStateDescription('Cửa hàng này chưa có giao dịch nào.')
            ->emptyStateIcon('heroicon-o-banknotes');
    }
}
