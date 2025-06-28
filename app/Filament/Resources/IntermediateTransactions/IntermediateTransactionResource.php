<?php

namespace App\Filament\Resources\IntermediateTransactions;

use App\Filament\Resources\IntermediateTransactions\Pages\CreateIntermediateTransaction;
use App\Filament\Resources\IntermediateTransactions\Pages\EditIntermediateTransaction;
use App\Filament\Resources\IntermediateTransactions\Pages\ListIntermediateTransactions;
use App\Filament\Resources\IntermediateTransactions\Schemas\IntermediateTransactionForm;
use App\Filament\Resources\IntermediateTransactions\Tables\IntermediateTransactionsTable;
use App\Models\IntermediateTransaction;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class IntermediateTransactionResource extends Resource
{
    protected static ?string $model = IntermediateTransaction::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-arrows-right-left';
    
    protected static ?string $navigationLabel = 'Giao dịch trung gian';
    
    protected static ?string $modelLabel = 'Giao dịch trung gian';
    
    protected static ?string $pluralModelLabel = 'Giao dịch trung gian';
    
    protected static string|\UnitEnum|null $navigationGroup = 'Quản lý giao dịch';
    
    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return IntermediateTransactionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return IntermediateTransactionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListIntermediateTransactions::route('/'),
            'create' => CreateIntermediateTransaction::route('/create'),
            'edit' => EditIntermediateTransaction::route('/{record}/edit'),
        ];
    }
}
