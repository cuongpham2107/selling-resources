<?php

namespace App\Filament\Resources\PersonalStores\Pages;

use App\Filament\Resources\PersonalStores\PersonalStoreResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditPersonalStore extends EditRecord
{
    protected static string $resource = PersonalStoreResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
