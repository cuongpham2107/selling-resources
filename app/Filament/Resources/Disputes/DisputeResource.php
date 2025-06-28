<?php

namespace App\Filament\Resources\Disputes;

use App\Filament\Resources\Disputes\Pages\CreateDispute;
use App\Filament\Resources\Disputes\Pages\EditDispute;
use App\Filament\Resources\Disputes\Pages\ListDisputes;
use App\Filament\Resources\Disputes\Schemas\DisputeForm;
use App\Filament\Resources\Disputes\Tables\DisputesTable;
use App\Models\Dispute;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class DisputeResource extends Resource
{
    protected static ?string $model = Dispute::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedExclamationTriangle;

    protected static ?string $navigationLabel = 'Tranh chấp';

    protected static ?string $pluralModelLabel = 'Tranh chấp';

    protected static ?string $modelLabel = 'Tranh chấp';

    protected static string|UnitEnum|null $navigationGroup = 'Quản lý giao dịch';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return DisputeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return DisputesTable::configure($table);
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
            'index' => ListDisputes::route('/'),
            'create' => CreateDispute::route('/create'),
            'edit' => EditDispute::route('/{record}/edit'),
        ];
    }
}
