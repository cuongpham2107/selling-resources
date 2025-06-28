<?php

namespace App\Filament\Resources\GeneralChats;

use App\Filament\Resources\GeneralChats\Pages\CreateGeneralChat;
use App\Filament\Resources\GeneralChats\Pages\EditGeneralChat;
use App\Filament\Resources\GeneralChats\Pages\ListGeneralChats;
use App\Filament\Resources\GeneralChats\Schemas\GeneralChatForm;
use App\Filament\Resources\GeneralChats\Tables\GeneralChatsTable;
use App\Models\GeneralChat;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GeneralChatResource extends Resource
{
    protected static ?string $model = GeneralChat::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedChatBubbleLeftRight;

    protected static ?string $navigationLabel = 'Chat chung';

    protected static ?string $pluralModelLabel = 'Chat chung';

    protected static ?string $modelLabel = 'Tin nhắn';

    protected static string|UnitEnum|null $navigationGroup = 'Quản lý chat';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return GeneralChatForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GeneralChatsTable::configure($table);
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
            'index' => ListGeneralChats::route('/'),
            'create' => CreateGeneralChat::route('/create'),
            'edit' => EditGeneralChat::route('/{record}/edit'),
        ];
    }
}
