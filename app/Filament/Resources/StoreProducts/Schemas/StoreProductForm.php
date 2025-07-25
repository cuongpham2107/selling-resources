<?php

namespace App\Filament\Resources\StoreProducts\Schemas;

use App\Models\PersonalStore;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\DateTimePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\MarkdownEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Filament\Support\RawJs;

class StoreProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->columns(2)
            ->components([
                Select::make('store_id')
                    ->label('Cửa hàng')
                    ->relationship('store', 'store_name')
                    ->searchable()
                    ->preload()
                    ->required()
                    ->createOptionForm([
                        TextInput::make('store_name')
                            ->label('Tên cửa hàng')
                            ->required()
                            ->maxLength(255),
                        Select::make('owner_id')
                            ->label('Chủ cửa hàng')
                            ->relationship('owner', 'username')
                            ->searchable()
                            ->required(),
                    ])
                    ->columnSpan(1),

                TextInput::make('name')
                    ->label('Tên sản phẩm')
                    ->required()
                    ->maxLength(255)
                    ->columnSpan(1),

                TextInput::make('price')
                    ->label('Giá (VNĐ)')
                    ->required()
                    ->numeric()
                    ->minValue(0)
                    ->suffix('VNĐ')
                    ->columnSpan(1)
                    ->mask(RawJs::make('$money($input)'))
                    ->stripCharacters(','),

                Toggle::make('is_active')
                    ->inline(false)
                    ->label('Kích hoạt')
                    ->default(true)
                    ->columnSpan(1),

                Textarea::make('description')
                    ->label('Mô tả ngắn')
                    ->rows(5)
                    ->cols(20)
                    ->maxLength(500)
                    ->columnSpanFull(),

                MarkdownEditor::make('content')
                    ->label('Nội dung chi tiết')
                    ->required()

                    ->columnSpanFull(),

                FileUpload::make('images')
                    ->label('Hình ảnh sản phẩm')
                    ->image()
                    ->multiple()
                    ->reorderable()
                    ->maxFiles(5)
                    ->directory('store-products')
                    ->columnSpanFull(),

                // Admin only fields
                Toggle::make('is_sold')
                    ->inline(false)
                    ->label('Đã bán')
                    ->columnSpan(1),


                Toggle::make('is_deleted')
                    ->label('Đã xóa')
                    ->inline(false)
                    ->disabled()
                    ->columnSpan(1),

                DateTimePicker::make('sold_at')
                    ->label('Ngày bán')

                    ->disabled()
                    ->columnSpan(1),
                Select::make('deleted_by')
                    ->label('Xóa bởi')
                    ->relationship('deletedBy', 'name')
                    ->disabled()
                    ->columnSpan(1),

                Textarea::make('delete_reason')
                    ->label('Lý do xóa')
                    ->disabled()
                    ->columnSpanFull(),

                DateTimePicker::make('created_at')
                    ->label('Thời gian tạo')
                    ->visibleOn('edit')
                    ->columnSpan(1),

                DateTimePicker::make('updated_at')
                    ->label('Cập nhật lần cuối')
                    ->visibleOn('edit')
                    ->columnSpan(1),
            ]);
    }
}
