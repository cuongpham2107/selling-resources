<?php

namespace App\Filament\Resources\TransactionChats\Pages;

use App\Filament\Resources\TransactionChats\TransactionChatResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditTransactionChat extends EditRecord
{
    protected static string $resource = TransactionChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
