<?php

namespace App\Filament\Resources\CustomerPoints\Pages;

use App\Filament\Resources\CustomerPoints\CustomerPointResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListCustomerPoints extends ListRecords
{
    protected static string $resource = CustomerPointResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
