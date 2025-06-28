<?php

namespace App\Filament\Resources\GeneralChats\Pages;

use App\Filament\Resources\GeneralChats\GeneralChatResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditGeneralChat extends EditRecord
{
    protected static string $resource = GeneralChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
