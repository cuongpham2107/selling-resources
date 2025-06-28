<?php

namespace App\Filament\Resources\GeneralChats\Pages;

use App\Filament\Resources\GeneralChats\GeneralChatResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListGeneralChats extends ListRecords
{
    protected static string $resource = GeneralChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
