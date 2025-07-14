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
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class PointsRelationManager extends RelationManager
{
    protected static string $relationship = 'points';
    
    protected static ?string $title = 'Điểm khách hàng';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $points = $ownerRecord->points;
        $hasPoints = $points && $points->points > 0;
        
        return Tab::make('Điểm')
            ->badge($hasPoints ? number_format($points->points, 0, ',', '.') . ' điểm' : '0 điểm')
            ->badgeColor($hasPoints ? 'warning' : 'gray')
            ->badgeTooltip('Tổng điểm tích lũy')
            ->icon('heroicon-m-star');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('points')
                    ->label('Điểm')
                    ->required()
                    ->numeric()
                    ->default(0)
                    ->minValue(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('points')
            ->columns([
                TextColumn::make('points')
                    ->label('Điểm')
                    ->formatStateUsing(fn ($state) => number_format($state, 0, ',', '.') . ' điểm')
                    ->sortable()
                    ->searchable(),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
                
                TextColumn::make('updated_at')
                    ->label('Cập nhật')
                    ->dateTime()
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
