<?php

namespace App\Filament\Resources\CustomerPoints\Pages;

use App\Filament\Resources\CustomerPoints\CustomerPointResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCustomerPoint extends CreateRecord
{
    protected static string $resource = CustomerPointResource::class;
}
