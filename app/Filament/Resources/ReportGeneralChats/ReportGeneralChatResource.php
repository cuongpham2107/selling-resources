<?php

namespace App\Filament\Resources\ReportGeneralChats;

use App\Filament\Resources\ReportGeneralChats\Pages\CreateReportGeneralChat;
use App\Filament\Resources\ReportGeneralChats\Pages\EditReportGeneralChat;
use App\Filament\Resources\ReportGeneralChats\Pages\ListReportGeneralChats;
use App\Filament\Resources\ReportGeneralChats\Schemas\ReportGeneralChatForm;
use App\Filament\Resources\ReportGeneralChats\Tables\ReportGeneralChatsTable;
use App\Models\ReportGeneralChat;
use BackedEnum;
use UnitEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class ReportGeneralChatResource extends Resource
{
    protected static ?string $model = ReportGeneralChat::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedExclamationTriangle;

    protected static ?string $navigationLabel = 'Báo cáo chat';

    protected static ?string $pluralModelLabel = 'Báo cáo chat';

    protected static ?string $modelLabel = 'Báo cáo';

    protected static string|UnitEnum|null $navigationGroup = 'Quản lý chat';

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        return ReportGeneralChatForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return ReportGeneralChatsTable::configure($table);
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
            'index' => ListReportGeneralChats::route('/'),
            'create' => CreateReportGeneralChat::route('/create'),
            'edit' => EditReportGeneralChat::route('/{record}/edit'),
        ];
    }
}
