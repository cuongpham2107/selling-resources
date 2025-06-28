<?php

namespace App\Filament\Resources\TransactionChats\Pages;

use App\Filament\Resources\TransactionChats\TransactionChatResource;
use Filament\Resources\Pages\CreateRecord;

class CreateTransactionChat extends CreateRecord
{
    protected static string $resource = TransactionChatResource::class;
}
