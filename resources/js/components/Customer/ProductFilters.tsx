import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { 
    Search, 
    Filter, 
    Grid3X3, 
    List
} from 'lucide-react';

interface ProductFiltersProps {
    filters: {
        search: string;
        min_price: string;
        max_price: string;
        store_id?: string;
        sort: string;
    };
    popularStores?: Array<{
        id: number;
        store_name: string;
    }>;
    viewMode: 'grid' | 'list';
    onViewModeChange: (mode: 'grid' | 'list') => void;
    searchUrl: string;
    showStoreFilter?: boolean;
    triggerButton?: React.ReactNode;
}

export default function ProductFilters({
    filters,
    popularStores = [],
    viewMode,
    onViewModeChange,
    searchUrl,
    showStoreFilter = true,
    triggerButton
}: ProductFiltersProps) {
    const [searchQuery, setSearchQuery] = useState(filters.search);
    const [minPrice, setMinPrice] = useState(filters.min_price);
    const [maxPrice, setMaxPrice] = useState(filters.max_price);
    const [selectedStore, setSelectedStore] = useState(
        filters.store_id && filters.store_id !== '' ? filters.store_id : 'all'
    );
    const [sortBy, setSortBy] = useState(filters.sort);
    const [filterDialogOpen, setFilterDialogOpen] = useState(false);

    const handleSearch = () => {
        const searchParams: Record<string, string> = {
            search: searchQuery,
            min_price: minPrice,
            max_price: maxPrice,
            sort: sortBy,
        };

        if (showStoreFilter) {
            searchParams.store_id = selectedStore === 'all' ? '' : selectedStore;
        }

        router.get(searchUrl, searchParams, {
            preserveState: true,
            preserveScroll: true,
        });
        setFilterDialogOpen(false);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setMinPrice('');
        setMaxPrice('');
        if (showStoreFilter) {
            setSelectedStore('all');
        }
        setSortBy('created_at');
        router.get(searchUrl);
    };

    const handleSortChange = (value: string) => {
        setSortBy(value);
        const searchParams: Record<string, string> = {
            ...filters,
            sort: value,
        };

        router.get(searchUrl, searchParams, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const defaultTriggerButton = (
        <Button variant="outline" size="sm">
            <Filter className="h-4 w-4" />
        </Button>
    );

    return (
        <Dialog open={filterDialogOpen} onOpenChange={setFilterDialogOpen}>
            <DialogTrigger asChild>
                {triggerButton || defaultTriggerButton}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Filter className="h-5 w-5" />
                        Tìm kiếm & Lọc sản phẩm
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                    {/* Search Bar */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Tìm kiếm sản phẩm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                        </div>
                        <Button onClick={handleSearch}>
                            Tìm kiếm
                        </Button>
                    </div>

                    {/* Filters Row */}
                    <div className={`grid grid-cols-1 gap-4 ${showStoreFilter ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Giá từ</label>
                            <Input
                                type="number"
                                placeholder="0"
                                value={minPrice}
                                onChange={(e) => setMinPrice(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Giá đến</label>
                            <Input
                                type="number"
                                placeholder="999999999"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(e.target.value)}
                            />
                        </div>
                        {showStoreFilter && (
                            <div className="md:col-span-1">
                                <label className="text-sm font-medium mb-1 block">Cửa hàng</label>
                                <Select value={selectedStore} onValueChange={(value) => setSelectedStore(value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Tất cả cửa hàng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả cửa hàng</SelectItem>
                                        {popularStores.map((store) => (
                                            <SelectItem key={store.id} value={store.id.toString()}>
                                                {store.store_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                        <div className={showStoreFilter ? 'md:col-span-1' : 'md:col-span-1'}>
                            <label className="text-sm font-medium mb-1 block">Sắp xếp</label>
                            <Select value={sortBy} onValueChange={handleSortChange}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Mới nhất</SelectItem>
                                    {showStoreFilter && <SelectItem value="popular">Phổ biến</SelectItem>}
                                    <SelectItem value="price_low">Giá thấp → cao</SelectItem>
                                    <SelectItem value="price_high">Giá cao → thấp</SelectItem>
                                    <SelectItem value="name">Tên A → Z</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4">
                        <Button variant="outline" onClick={clearFilters}>
                            Xóa bộ lọc
                        </Button>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Hiển thị:</span>
                            <Button
                                variant={viewMode === 'grid' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onViewModeChange('grid')}
                            >
                                <Grid3X3 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant={viewMode === 'list' ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => onViewModeChange('list')}
                            >
                                <List className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
