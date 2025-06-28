<?php

namespace App\Filament\Resources\CustomerBalances;

use App\Filament\Resources\CustomerBalances\Pages\CreateCustomerBalance;
use App\Filament\Resources\CustomerBalances\Pages\EditCustomerBalance;
use App\Filament\Resources\CustomerBalances\Pages\ListCustomerBalances;
use App\Filament\Resources\CustomerBalances\Schemas\CustomerBalanceForm;
use App\Filament\Resources\CustomerBalances\Tables\CustomerBalancesTable;
use App\Models\CustomerBalance;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CustomerBalanceResource extends Resource
{
    protected static ?string $model = CustomerBalance::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBanknotes;

    protected static string|\UnitEnum|null $navigationGroup = 'Quản lý người dùng';

    protected static ?string $modelLabel = 'Số dư khách hàng';

    protected static ?string $pluralModelLabel = 'Số dư khách hàng';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return CustomerBalanceForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CustomerBalancesTable::configure($table);
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
            'index' => ListCustomerBalances::route('/'),
            'create' => CreateCustomerBalance::route('/create'),
            'edit' => EditCustomerBalance::route('/{record}/edit'),
        ];
    }
}
