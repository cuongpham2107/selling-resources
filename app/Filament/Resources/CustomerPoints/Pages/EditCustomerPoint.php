<?php

namespace App\Filament\Resources\CustomerPoints\Pages;

use App\Filament\Resources\CustomerPoints\CustomerPointResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditCustomerPoint extends EditRecord
{
    protected static string $resource = CustomerPointResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
