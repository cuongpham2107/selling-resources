<?php

namespace App\Filament\Resources\PersonalStores;

use App\Filament\Resources\PersonalStores\Pages\CreatePersonalStore;
use App\Filament\Resources\PersonalStores\Pages\EditPersonalStore;
use App\Filament\Resources\PersonalStores\Pages\ListPersonalStores;
use App\Filament\Resources\PersonalStores\Schemas\PersonalStoreForm;
use App\Filament\Resources\PersonalStores\Tables\PersonalStoresTable;
use App\Models\PersonalStore;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use UnitEnum;

class PersonalStoreResource extends Resource
{
    protected static ?string $model = PersonalStore::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingStorefront;

    protected static ?string $navigationLabel = 'Cửa hàng cá nhân';

    protected static ?string $pluralModelLabel = 'Cửa hàng cá nhân';

    protected static ?string $modelLabel = 'Cửa hàng';

    protected static string|UnitEnum|null $navigationGroup = 'Quản lý cửa hàng';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return PersonalStoreForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return PersonalStoresTable::configure($table);
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
            'index' => ListPersonalStores::route('/'),
            'create' => CreatePersonalStore::route('/create'),
            'edit' => EditPersonalStore::route('/{record}/edit'),
        ];
    }
}
