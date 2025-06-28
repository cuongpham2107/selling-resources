<?php

namespace App\Filament\Resources\TransactionChats;

use App\Filament\Resources\TransactionChats\Pages\CreateTransactionChat;
use App\Filament\Resources\TransactionChats\Pages\EditTransactionChat;
use App\Filament\Resources\TransactionChats\Pages\ListTransactionChats;
use App\Filament\Resources\TransactionChats\Schemas\TransactionChatForm;
use App\Filament\Resources\TransactionChats\Tables\TransactionChatsTable;
use App\Models\TransactionChat;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TransactionChatResource extends Resource
{
    protected static ?string $model = TransactionChat::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeft;

    protected static string|\UnitEnum|null $navigationGroup = 'Quản lý chat';

    protected static ?string $modelLabel = 'Tin nhắn giao dịch';

    protected static ?string $pluralModelLabel = 'Tin nhắn giao dịch';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return TransactionChatForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TransactionChatsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTransactionChats::route('/'),
            'create' => CreateTransactionChat::route('/create'),
            'edit' => EditTransactionChat::route('/{record}/edit'),
        ];
    }
}
