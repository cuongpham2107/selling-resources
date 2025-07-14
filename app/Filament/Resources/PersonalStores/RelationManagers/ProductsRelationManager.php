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
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class ProductsRelationManager extends RelationManager
{
    protected static string $relationship = 'products';
    
    protected static ?string $title = 'Sản phẩm cửa hàng';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $productsCount = $ownerRecord->products()->count();
        $activeProductsCount = $ownerRecord->products()->where('is_active', true)->count();
        
        return Tab::make('Sản phẩm')
            ->badge($productsCount)
            ->badgeColor($productsCount > 0 ? 'primary' : 'gray')
            ->badgeTooltip("Tổng cộng {$productsCount} sản phẩm ({$activeProductsCount} đang hoạt động)")
            ->icon('heroicon-m-cube');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin sản phẩm')
                    ->schema([
                        TextInput::make('product_name')
                            ->label('Tên sản phẩm')
                            ->required()
                            ->maxLength(255),

                        Textarea::make('description')
                            ->label('Mô tả')
                            ->maxLength(1000)
                            ->rows(3),

                        TextInput::make('price')
                            ->label('Giá (VNĐ)')
                            ->required()
                            ->numeric()
                            ->prefix('₫')
                            ->minValue(0),

                        Select::make('category')
                            ->label('Danh mục')
                            ->options([
                                'game_account' => 'Tài khoản game',
                                'game_items' => 'Vật phẩm game',
                                'software' => 'Phần mềm',
                                'digital_assets' => 'Tài sản số',
                                'other' => 'Khác',
                            ])
                            ->required(),

                        FileUpload::make('images')
                            ->label('Hình ảnh')
                            ->image()
                            ->multiple()
                            ->maxFiles(5),
                    ]),

                Section::make('Trạng thái')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Đang hoạt động')
                            ->default(true),

                        Toggle::make('is_featured')
                            ->label('Sản phẩm nổi bật')
                            ->default(false),

                        Toggle::make('is_sold')
                            ->label('Đã bán')
                            ->disabled()
                            ->default(false),
                    ])
                    ->columns(3),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('product_name')
            ->columns([
                ImageColumn::make('images')
                    ->label('Hình ảnh')
                    ->circular()
                    ->stacked()
                    ->limit(3)
                    ->limitedRemainingText()
                    ->getStateUsing(function ($record) {
                        return $record->images ? json_decode($record->images, true) : [];
                    }),

                TextColumn::make('product_name')
                    ->label('Tên sản phẩm')
                    ->searchable()
                    ->sortable()
                    ->weight('medium'),

                TextColumn::make('category')
                    ->label('Danh mục')
                    ->badge()
                    ->formatStateUsing(function (string $state): string {
                        return match ($state) {
                            'game_account' => 'Tài khoản game',
                            'game_items' => 'Vật phẩm game',
                            'software' => 'Phần mềm',
                            'digital_assets' => 'Tài sản số',
                            'other' => 'Khác',
                            default => $state,
                        };
                    }),

                TextColumn::make('price')
                    ->label('Giá')
                    ->formatStateUsing(fn (string $state): string => number_format($state) . ' VNĐ')
                    ->sortable(),

                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-circle')
                    ->falseIcon('heroicon-o-x-circle')
                    ->trueColor('success')
                    ->falseColor('danger'),

                IconColumn::make('is_featured')
                    ->label('Nổi bật')
                    ->boolean()
                    ->trueIcon('heroicon-o-star')
                    ->falseIcon('heroicon-o-star')
                    ->trueColor('warning')
                    ->falseColor('gray'),

                IconColumn::make('is_sold')
                    ->label('Đã bán')
                    ->boolean()
                    ->trueIcon('heroicon-o-check-badge')
                    ->falseIcon('heroicon-o-clock')
                    ->trueColor('success')
                    ->falseColor('gray'),

                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime('d/m/Y H:i')
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('category')
                    ->label('Danh mục')
                    ->options([
                        'game_account' => 'Tài khoản game',
                        'game_items' => 'Vật phẩm game',
                        'software' => 'Phần mềm',
                        'digital_assets' => 'Tài sản số',
                        'other' => 'Khác',
                    ]),

                TernaryFilter::make('is_active')
                    ->label('Trạng thái hoạt động'),

                TernaryFilter::make('is_featured')
                    ->label('Sản phẩm nổi bật'),

                TernaryFilter::make('is_sold')
                    ->label('Đã bán'),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Thêm sản phẩm'),
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
            ->emptyStateHeading('Chưa có sản phẩm nào')
            ->emptyStateDescription('Cửa hàng này chưa có sản phẩm nào.')
            ->emptyStateIcon('heroicon-o-cube');
    }
}
