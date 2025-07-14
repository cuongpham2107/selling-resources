<?php

namespace App\Filament\Resources\Customers\RelationManagers;

use Filament\Actions\AssociateAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\DissociateAction;
use Filament\Actions\DissociateBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Toggle;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\BadgeColumn;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Table;
use Filament\Schemas\Components\Tabs\Tab;
use Illuminate\Database\Eloquent\Model;

class ReferralsRelationManager extends RelationManager
{
    protected static string $relationship = 'referrals';
    
    protected static ?string $title = 'Giới thiệu';

    public static function getTabComponent(Model $ownerRecord, string $pageClass): Tab
    {
        $referralCount = $ownerRecord->referrals()->count();
        
        return Tab::make('Giới thiệu')
            ->badge($referralCount)
            ->badgeColor($referralCount > 0 ? 'info' : 'gray')
            ->badgeTooltip('Số người đã được giới thiệu bởi khách hàng này')
            ->icon('heroicon-m-user-group');
    }

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('username')
                    ->label('Tên đăng nhập')
                    ->required()
                    ->maxLength(50),
                
                TextInput::make('email')
                    ->label('Email')
                    ->email()
                    ->required()
                    ->maxLength(255),
                
                TextInput::make('phone')
                    ->label('Số điện thoại')
                    ->tel()
                    ->maxLength(20),
                
                Toggle::make('is_active')
                    ->label('Hoạt động')
                    ->default(true),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('username')
            ->columns([
                TextColumn::make('username')
                    ->label('Tên đăng nhập')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('email')
                    ->label('Email')
                    ->searchable()
                    ->sortable(),
                
                TextColumn::make('referral_code')
                    ->label('Mã giới thiệu')
                    ->searchable()
                    ->copyable(),
                
                IconColumn::make('is_active')
                    ->label('Hoạt động')
                    ->boolean(),
                
                IconColumn::make('email_verified_at')
                    ->label('Email đã xác minh')
                    ->boolean()
                    ->getStateUsing(fn ($record) => !is_null($record->email_verified_at)),
                
                TextColumn::make('created_at')
                    ->label('Ngày tham gia')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                //
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
