<?php

namespace App\Filament\Resources\IntermediateTransactions\Pages;

use App\Filament\Resources\IntermediateTransactions\IntermediateTransactionResource;
use Filament\Actions\EditAction;
use Filament\Resources\Pages\ViewRecord;

class ViewIntermediateTransaction extends ViewRecord
{
    protected static string $resource = IntermediateTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            EditAction::make()
                ->label('Chỉnh sửa'),
        ];
    }
}
