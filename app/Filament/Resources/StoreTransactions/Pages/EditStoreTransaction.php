<?php

namespace App\Filament\Resources\StoreTransactions\Pages;

use App\Filament\Resources\StoreTransactions\StoreTransactionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditStoreTransaction extends EditRecord
{
    protected static string $resource = StoreTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
