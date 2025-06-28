<?php

namespace App\Filament\Resources\PersonalStores\Pages;

use App\Filament\Resources\PersonalStores\PersonalStoreResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListPersonalStores extends ListRecords
{
    protected static string $resource = PersonalStoreResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
