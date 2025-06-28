<?php

namespace App\Filament\Resources\TransactionChats\Pages;

use App\Filament\Resources\TransactionChats\TransactionChatResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListTransactionChats extends ListRecords
{
    protected static string $resource = TransactionChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
