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
use Filament\Forms\Components\Section;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class BalanceRelationManager extends RelationManager
{
    protected static string $relationship = 'balance';
    
    protected static ?string $title = 'Số dư khách hàng';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $balance = $ownerRecord->balance;
        $hasBalance = $balance && $balance->balance > 0;
        
        return Tab::make('Số dư')
            ->badge($hasBalance ? number_format($balance->balance, 0, ',', '.') . ' VNĐ' : '0 VNĐ')
            ->badgeColor($hasBalance ? 'success' : 'gray')
            ->badgeTooltip('Số dư hiện tại')
            ->icon('heroicon-m-banknotes');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('balance')
                    ->label('Số dư')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->prefix('VNĐ')
                    ->step(0.01),
                
                TextInput::make('locked_balance')
                    ->label('Số dư bị khóa')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->prefix('VNĐ')
                    ->step(0.01),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('balance')
            ->columns([
                TextColumn::make('balance')
                    ->label('Số dư')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('locked_balance')
                    ->label('Số dư bị khóa')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' VNĐ')
                    ->sortable(),
                
                TextColumn::make('available_balance')
                    ->label('Số dư khả dụng')
                    ->formatStateUsing(fn ($record) => number_format(($record->balance - $record->locked_balance), 0, ',', '.') . ' VNĐ')
                    ->getStateUsing(fn ($record) => $record->balance - $record->locked_balance)
                    ->sortable(),
                
                TextColumn::make('updated_at')
                    ->label('Cập nhật lần cuối')
                    ->dateTime()
                    ->sortable(),
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
