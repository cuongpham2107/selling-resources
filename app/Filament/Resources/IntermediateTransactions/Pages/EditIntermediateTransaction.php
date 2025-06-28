<?php

namespace App\Filament\Resources\IntermediateTransactions\Pages;

use App\Filament\Resources\IntermediateTransactions\IntermediateTransactionResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditIntermediateTransaction extends EditRecord
{
    protected static string $resource = IntermediateTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
