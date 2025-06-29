<?php

namespace App\Filament\Resources\ReportGeneralChats\Pages;

use App\Filament\Resources\ReportGeneralChats\ReportGeneralChatResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditReportGeneralChat extends EditRecord
{
    protected static string $resource = ReportGeneralChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
