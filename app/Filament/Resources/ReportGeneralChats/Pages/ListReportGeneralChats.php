<?php

namespace App\Filament\Resources\ReportGeneralChats\Pages;

use App\Filament\Resources\ReportGeneralChats\ReportGeneralChatResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListReportGeneralChats extends ListRecords
{
    protected static string $resource = ReportGeneralChatResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->label('Tạo báo cáo mới'),
        ];
    }
}
