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
use Filament\Tables\Columns\BadgeColumn;
use App\Enums\DisputeStatus;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class CreatedDisputesRelationManager extends RelationManager
{
    protected static string $relationship = 'createdDisputes';
    
    protected static ?string $title = 'Tranh chấp đã tạo';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $disputeCount = $ownerRecord->createdDisputes()->count();
        $pendingCount = $ownerRecord->createdDisputes()
            ->where('status', 'pending')
            ->count();
        
        return Tab::make('Tranh chấp')
            ->badge($disputeCount)
            ->badgeColor($pendingCount > 0 ? 'danger' : ($disputeCount > 0 ? 'info' : 'gray'))
            ->badgeTooltip($disputeCount > 0 ? 
                'Đang chờ xử lý: ' . $pendingCount . '/' . $disputeCount : 
                'Chưa có tranh chấp'
            )
            ->icon('heroicon-m-exclamation-triangle');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->required()
                    ->maxLength(255),
                
                TextInput::make('transaction_id')
                    ->label('ID giao dịch')
                    ->required()
                    ->numeric(),
                
                Textarea::make('reason')
                    ->label('Lý do')
                    ->required()
                    ->columnSpanFull(),
                
                Select::make('status')
                    ->label('Trạng thái')
                    ->options([
                        'pending' => 'Chờ xử lý',
                        'investigating' => 'Đang điều tra',
                        'resolved' => 'Đã giải quyết',
                        'rejected' => 'Đã từ chối',
                    ])
                    ->required(),
                
                Textarea::make('admin_notes')
                    ->label('Ghi chú của admin')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('reason')
            ->columns([
                TextColumn::make('transaction_type')
                    ->label('Loại giao dịch')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('transaction_id')
                    ->label('ID giao dịch')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('reason')
                    ->label('Lý do')
                    ->limit(50)
                    ->tooltip(function (TextColumn $column): ?string {
                        $state = $column->getState();
                        if (strlen($state) <= $column->getCharacterLimit()) {
                            return null;
                        }
                        return $state;
                    }),
                
                BadgeColumn::make('status')
                    ->label('Trạng thái')
                    ->formatStateUsing(fn (string $state): string => match ($state) {
                        'pending' => 'Chờ xử lý',
                        'investigating' => 'Đang điều tra',
                        'resolved' => 'Đã giải quyết',
                        'rejected' => 'Đã từ chối',
                        default => $state,
                    })
                    ->colors([
                        'warning' => 'pending',
                        'info' => 'investigating',
                        'success' => 'resolved',
                        'danger' => 'rejected',
                    ]),
                
                TextColumn::make('assignedModerator.name')
                    ->label('Được giao cho')
                    ->placeholder('Chưa giao')
                    ->searchable(),
                
                TextColumn::make('created_at')
                    ->label('Ngày tạo')
                    ->dateTime()
                    ->sortable(),
                
                TextColumn::make('resolved_at')
                    ->label('Ngày giải quyết')
                    ->dateTime()
                    ->placeholder('Chưa giải quyết')
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
