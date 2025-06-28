<?php

namespace App\Filament\Resources\TransactionFees\Pages;

use App\Filament\Resources\TransactionFees\TransactionFeeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTransactionFees extends ListRecords
{
    protected static string $resource = TransactionFeeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
