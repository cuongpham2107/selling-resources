<?php

namespace App\Filament\Resources\TransactionFees\Pages;

use App\Filament\Resources\TransactionFees\TransactionFeeResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTransactionFee extends EditRecord
{
    protected static string $resource = TransactionFeeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
