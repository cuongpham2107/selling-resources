<?php

namespace App\Filament\Resources\Users\Schemas;

use Filament\Schemas\Schema;
use Filament\Schemas\Components\Section;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Thông tin người dùng')
                    ->description('Điền thông tin người dùng mới')
                    ->schema([
                        \Filament\Forms\Components\TextInput::make('name')
                            ->label("Tên người dùng")
                            ->required()
                            ->maxLength(255)
                            ->unique(
                                ignoreRecord: true,
                                modifyRuleUsing: fn(\Illuminate\Validation\Rules\Unique $rule): \Illuminate\Validation\Rules\Unique => $rule->where('tenant_id', \Filament\Facades\Filament::getTenant()?->id ?? null)
                            ),
                        \Filament\Forms\Components\Select::make('roles')
                            ->label("Vai trò")
                            ->relationship('roles', 'name')
                            ->multiple()
                            ->preload()
                            ->searchable(),
                        \Filament\Forms\Components\TextInput::make('email')
                            ->label("Địa chỉ email")
                            ->email()
                            ->required()
                            ->maxLength(255)
                            ->unique(
                                ignoreRecord: true,
                                modifyRuleUsing: fn(\Illuminate\Validation\Rules\Unique $rule): \Illuminate\Validation\Rules\Unique => $rule->where('tenant_id', \Filament\Facades\Filament::getTenant()?->id ?? null)
                            ),
                        // \Filament\Forms\Components\TextInput::make('password')
                        //     ->label("Mật khẩu")
                        //     ->password()
                        //     ->revealable()
                        //     ->minLength(8)
                        //     ->confirmed()

                    ])->columns(2)
            ])->columns(1);
    }
}
