<?php

namespace App\Filament\Resources\StoreTransactions;

use App\Filament\Resources\StoreTransactions\Pages\CreateStoreTransaction;
use App\Filament\Resources\StoreTransactions\Pages\EditStoreTransaction;
use App\Filament\Resources\StoreTransactions\Pages\ListStoreTransactions;
use App\Filament\Resources\StoreTransactions\Pages\ViewStoreTransaction;
use App\Filament\Resources\StoreTransactions\RelationManagers;
use App\Filament\Resources\StoreTransactions\Schemas\StoreTransactionForm;
use App\Filament\Resources\StoreTransactions\Tables\StoreTransactionsTable;
use App\Models\StoreTransaction;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class StoreTransactionResource extends Resource
{
    protected static ?string $model = StoreTransaction::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCreditCard;

    protected static ?string $navigationLabel = 'Giao dịch cửa hàng';

    protected static ?string $pluralModelLabel = 'Giao dịch cửa hàng';

    protected static ?string $modelLabel = 'Giao dịch';

    protected static string|UnitEnum|null $navigationGroup = 'Quản lý giao dịch';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return StoreTransactionForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return StoreTransactionsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            RelationManagers\ChatsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListStoreTransactions::route('/'),
            'create' => CreateStoreTransaction::route('/create'),
            'view' => ViewStoreTransaction::route('/{record}'),
            'edit' => EditStoreTransaction::route('/{record}/edit'),
        ];
    }
}
