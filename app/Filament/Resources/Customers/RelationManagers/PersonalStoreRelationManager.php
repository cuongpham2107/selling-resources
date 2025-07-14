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
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class PersonalStoreRelationManager extends RelationManager
{
    protected static string $relationship = 'personalStore';
    
    protected static ?string $title = 'Cửa hàng cá nhân';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $store = $ownerRecord->personalStore;
        $hasStore = (bool) $store;
        $isActive = $hasStore && $store->is_active;
        
        return Tab::make('Cửa hàng')
            ->badge($hasStore ? ($isActive ? 'Hoạt động' : 'Không hoạt động') : 'Chưa có')
            ->badgeColor($hasStore ? ($isActive ? 'success' : 'warning') : 'gray')
            ->badgeTooltip($hasStore ? 'Trạng thái cửa hàng' : 'Khách hàng chưa có cửa hàng cá nhân')
            ->icon('heroicon-m-building-storefront');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin cửa hàng')
                    ->schema([
                        TextInput::make('store_name')
                            ->label('Tên cửa hàng')
                            ->required()
                            ->maxLength(255),
                        
                        Textarea::make('description')
                            ->label('Mô tả')
                            ->columnSpanFull(),
                        
                        TextInput::make('avatar')
                            ->label('URL Avatar')
                            ->url()
                            ->maxLength(500),
                    ])
                    ->columns(2),
                
                Section::make('Trạng thái cửa hàng')
                    ->schema([
                        Toggle::make('is_active')
                            ->label('Hoạt động')
                            ->default(true),
                        
                        Toggle::make('is_verified')
                            ->label('Đã xác minh'),
                        
                        Toggle::make('is_locked')
                            ->label('Bị khóa'),
                    ])
                    ->columns(3),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('store_name')
            ->columns([
                ImageColumn::make('avatar')
                    ->label('Avatar')
                    ->circular()
                    ->defaultImageUrl('/images/default-avatar.png'),
                
                TextColumn::make('store_name')
                    ->label('Tên cửa hàng')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('description')
                    ->label('Mô tả')
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= $column->getCharacterLimit()) {
                            return null;
                        }
                        return $state;
                    }),
                
                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean()
                    ->sortable(),
                
                IconColumn::make('is_verified')
                    ->label('Đã xác minh')
                    ->boolean()
                    ->sortable(),
                
                IconColumn::make('is_locked')
                    ->label('Bị khóa')
                    ->boolean()
                    ->sortable(),
                
                TextColumn::make('rating')
                    ->label('Đánh giá')
                    ->formatStateUsing(fn (?float $state): string => $state ? number_format($state, 1) . '/5' : 'N/A')
                    ->sortable(),
                
                TextColumn::make('total_sales')
                    ->label('Tổng bán')
                    ->numeric()
                    ->sortable(),
                
                TextColumn::make('total_products')
                    ->label('Tổng sản phẩm')
                    ->numeric()
                    ->sortable(),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
