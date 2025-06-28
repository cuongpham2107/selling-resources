<?php

namespace App\Filament\Resources\CustomerBalances\Pages;

use App\Filament\Resources\CustomerBalances\CustomerBalanceResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCustomerBalance extends EditRecord
{
    protected static string $resource = CustomerBalanceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
