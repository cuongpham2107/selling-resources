<?php

namespace App\Filament\Resources\IntermediateTransactions\Pages;

use App\Filament\Resources\IntermediateTransactions\IntermediateTransactionResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListIntermediateTransactions extends ListRecords
{
    protected static string $resource = IntermediateTransactionResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
