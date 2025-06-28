<?php

namespace App\Filament\Resources\StoreTransactions\Pages;

use App\Filament\Resources\StoreTransactions\StoreTransactionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListStoreTransactions extends ListRecords
{
    protected static string $resource = StoreTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
