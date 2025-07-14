<?php

namespace App\Filament\Resources\Customers;

use App\Filament\Resources\Customers\Pages\CreateCustomer;
use App\Filament\Resources\Customers\Pages\EditCustomer;
use App\Filament\Resources\Customers\Pages\ListCustomers;
use App\Filament\Resources\Customers\Pages\ViewCustomer;
use App\Filament\Resources\Customers\RelationManagers;
use App\Filament\Resources\Customers\Schemas\CustomerForm;
use App\Filament\Resources\Customers\Tables\CustomersTable;
use App\Models\Customer;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Resources\RelationManagers\RelationGroup;
use Filament\Schemas\Schema;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CustomerResource extends Resource
{
    protected static ?string $model = Customer::class;

    protected static string|BackedEnum|null $navigationIcon = 'heroicon-o-users';
    
    protected static ?string $navigationLabel = 'Khách hàng';
    
    protected static ?string $modelLabel = 'Khách hàng';
    
    protected static ?string $pluralModelLabel = 'Khách hàng';
    
    protected static string|\UnitEnum|null $navigationGroup = 'Quản lý người dùng';
    
    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return CustomerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CustomersTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            // Thông tin cơ bản
            RelationManagers\BalanceRelationManager::class,
            RelationManagers\PointsRelationManager::class,
            RelationManagers\PersonalStoreRelationManager::class,
            
            // Giao dịch
            RelationGroup::make('Giao dịch', [
                RelationManagers\BuyerTransactionsRelationManager::class,
                RelationManagers\SellerTransactionsRelationManager::class,
                RelationManagers\WalletTransactionsRelationManager::class,
                RelationManagers\TopupsRelationManager::class,
                RelationManagers\PointTransactionsRelationManager::class,
            ])
            ->tab(fn (Model $ownerRecord): Tab => Tab::make('Giao dịch')
                ->badge($ownerRecord->buyerTransactions()->count() + 
                        $ownerRecord->sellerTransactions()->count() + 
                        $ownerRecord->walletTransactions()->count())
                ->badgeColor('primary')
                ->badgeTooltip('Tổng số giao dịch của tất cả loại')
                ->icon('heroicon-m-arrows-right-left')
            ),
        
           
            RelationManagers\ReferralsRelationManager::class,
            RelationManagers\CreatedDisputesRelationManager::class,
            
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCustomers::route('/'),
            'create' => CreateCustomer::route('/create'),
            'view' => ViewCustomer::route('/{record}'),
            'edit' => EditCustomer::route('/{record}/edit'),
        ];
    }
}
