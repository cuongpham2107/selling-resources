<?php

namespace App\Filament\Resources\StoreTransactions\Pages;

use App\Filament\Resources\StoreTransactions\StoreTransactionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewStoreTransaction extends ViewRecord
{
    protected static string $resource = StoreTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()
                ->label('Chỉnh sửa'),
        ];
    }
}
