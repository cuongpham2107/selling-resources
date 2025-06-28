<?php

namespace App\Filament\Resources\CustomerBalances\Pages;

use App\Filament\Resources\CustomerBalances\CustomerBalanceResource;
use Filament\Resources\Pages\CreateRecord;

class CreateCustomerBalance extends CreateRecord
{
    protected static string $resource = CustomerBalanceResource::class;
}
