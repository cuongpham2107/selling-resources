<?php

namespace App\Filament\Resources\CustomerPoints;

use App\Filament\Resources\CustomerPoints\Pages\CreateCustomerPoint;
use App\Filament\Resources\CustomerPoints\Pages\EditCustomerPoint;
use App\Filament\Resources\CustomerPoints\Pages\ListCustomerPoints;
use App\Filament\Resources\CustomerPoints\Schemas\CustomerPointForm;
use App\Filament\Resources\CustomerPoints\Tables\CustomerPointsTable;
use App\Models\CustomerPoint;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CustomerPointResource extends Resource
{
    protected static ?string $model = CustomerPoint::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedStar;

    protected static string|\UnitEnum|null $navigationGroup = 'Quản lý người dùng';

    protected static ?string $modelLabel = 'C khách hàng';

    protected static ?string $pluralModelLabel = 'C khách hàng';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return CustomerPointForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CustomerPointsTable::configure($table);
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
            'index' => ListCustomerPoints::route('/'),
            'create' => CreateCustomerPoint::route('/create'),
            'edit' => EditCustomerPoint::route('/{record}/edit'),
        ];
    }
}
