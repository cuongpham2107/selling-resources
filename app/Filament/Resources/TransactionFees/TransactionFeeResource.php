<?php

namespace App\Filament\Resources\TransactionFees;

use App\Filament\Resources\TransactionFees\Pages\CreateTransactionFee;
use App\Filament\Resources\TransactionFees\Pages\EditTransactionFee;
use App\Filament\Resources\TransactionFees\Pages\ListTransactionFees;
use App\Filament\Resources\TransactionFees\Schemas\TransactionFeeForm;
use App\Filament\Resources\TransactionFees\Tables\TransactionFeesTable;
use App\Models\TransactionFee;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TransactionFeeResource extends Resource
{
    protected static ?string $model = TransactionFee::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCurrencyPound;

    protected static string|\UnitEnum|null $navigationGroup = 'Cấu hình hệ thống';

    protected static ?string $modelLabel = 'Phí giao dịch';

    protected static ?string $pluralModelLabel = 'Phí giao dịch';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return TransactionFeeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TransactionFeesTable::configure($table);
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
            'index' => ListTransactionFees::route('/'),
            'create' => CreateTransactionFee::route('/create'),
            
            'edit' => EditTransactionFee::route('/{record}/edit'),
        ];
    }
}
