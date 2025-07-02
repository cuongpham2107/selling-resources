import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProductFilters from '@/components/Customer/ProductFilters';
import { formatVND } from '@/lib/currency';
import { 
    Star,
    ShoppingCart,
    Store,
    Package,
    Users,
    Eye,
    Heart,
    Verified,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import type { StoreProduct } from '@/types';

interface ProductWithStore extends Omit<StoreProduct, 'store'> {
    store: {
        id: number;
        store_name: string;
        rating: number;
        is_verified: boolean;
    };
}

interface MarketplaceStats {
    total_products: number;
    total_stores: number;
    featured_stores: Array<{
        id: number;
        store_name: string;
        rating: number;
        avatar?: string;
    }>;
}

interface PaginatedProducts {
    data: ProductWithStore[];
    total: number;
    last_page: number;
    current_page: number;
    per_page: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    products: PaginatedProducts;
    stats: MarketplaceStats;
    popularStores: Array<{
        id: number;
        store_name: string;
    }>;
    filters: {
        search: string;
        min_price: string;
        max_price: string;
        store_id: string;
        sort: string;
    };
}

export default function MarketplaceIndex({ products, stats, popularStores, filters }: Props) {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const clearFilters = () => {
        router.get('/customer/marketplace');
    };

    return (
        <CustomerLayout>
            <Head title="Marketplace - Khám phá sản phẩm" />
            
            <div className="space-y-6 mx-auto max-w-8xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <h1 className="text-4xl font-bold mb-4">
                            🛍️ Marketplace - Khám phá sản phẩm
                        </h1>
                        <p className="text-xl opacity-90 mb-6">
                            Tìm kiếm và mua sắm từ hàng ngàn sản phẩm chất lượng
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-white/10 rounded-lg p-4">
                                <Package className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.total_products.toLocaleString()}</div>
                                <div className="text-sm opacity-80">Sản phẩm</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4">
                                <Store className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-2xl font-bold">{stats.total_stores}</div>
                                <div className="text-sm opacity-80">Cửa hàng</div>
                            </div>
                            <div className="bg-white/10 rounded-lg p-4 col-span-2 md:col-span-1">
                                <Users className="h-8 w-8 mx-auto mb-2" />
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-sm opacity-80">Hỗ trợ</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Featured Stores */}
                {stats.featured_stores.length > 0 && (
                    <Card >
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Star className="h-5 w-5 text-yellow-500" />
                                Cửa hàng nổi bật
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {stats.featured_stores.map((store) => (
                                    <Link 
                                        key={store.id}
                                        href={`/customer/marketplace/store/${store.id}`}
                                        className="text-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                                            <Store className="h-6 w-6 text-white" />
                                        </div>
                                        <div className="text-sm font-medium truncate">{store.store_name}</div>
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                            {store.rating.toFixed(1)}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Search and Filters - Hidden, moved to popup */}
                {/* 
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Tìm kiếm & Lọc sản phẩm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        ...existing code...
                    </CardContent>
                </Card>
                */}

                {/* Products Grid/List */}
                {products.data.length > 0 ? (
                    <div className="space-y-4">
                        {/* Results Info */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <p className="text-gray-600">
                                Hiển thị {((products.current_page - 1) * products.per_page) + 1}-{Math.min(products.current_page * products.per_page, products.total)} 
                                trong {products.total} sản phẩm
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">
                                    Trang {products.current_page} / {products.last_page}
                                </span>
                                <ProductFilters
                                    filters={filters}
                                    popularStores={popularStores}
                                    viewMode={viewMode}
                                    onViewModeChange={setViewMode}
                                    searchUrl="/customer/marketplace"
                                    showStoreFilter={true}
                                />
                            </div>
                        </div>

                        {/* Products */}
                        <div className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                            : "space-y-4"
                        }>
                            {products.data.map((product) => (
                                <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 py-0">
                                    {viewMode === 'grid' ? (
                                        <>
                                            <div className="relative">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={`/storage/${product.images[0]}`}
                                                        alt={product.name}
                                                        className="w-full h-48 object-cover rounded-t-lg"
                                                    />
                                                ) : (
                                                    <div className="w-full h-48 bg-gray-200 rounded-t-lg flex items-center justify-center">
                                                        <Package className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="absolute top-2 right-2">
                                                    <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Heart className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Link 
                                                            href={`/customer/marketplace/store/${product.store.id}`}
                                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                                                        >
                                                            <Store className="h-3 w-3" />
                                                            {product.store.store_name}
                                                            {product.store.is_verified && (
                                                                <Verified className="h-3 w-3 text-blue-500" />
                                                            )}
                                                        </Link>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-green-600">
                                                            {formatVND(product.price)}
                                                        </span>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            {product.store.rating.toFixed(1)}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Link 
                                                            href={`/customer/marketplace/product/${product.id}`}
                                                            className="flex-1"
                                                        >
                                                            <Button variant="outline" size="sm" className="w-full">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Xem
                                                            </Button>
                                                        </Link>
                                                        <Button size="sm" className="flex-1">
                                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                                            Mua
                                                        </Button>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </>
                                    ) : (
                                        <CardContent className="p-4">
                                            <div className="flex gap-4">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        src={`/storage/${product.images[0]}`}
                                                        alt={product.name}
                                                        className="w-24 h-24 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Package className="h-8 w-8 text-gray-400" />
                                                    </div>
                                                )}
                                                <div className="flex-1 space-y-2">
                                                    <h3 className="font-semibold group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <Link 
                                                            href={`/customer/marketplace/store/${product.store.id}`}
                                                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600"
                                                        >
                                                            <Store className="h-3 w-3" />
                                                            {product.store.store_name}
                                                            {product.store.is_verified && (
                                                                <Verified className="h-3 w-3 text-blue-500" />
                                                            )}
                                                        </Link>
                                                        <div className="flex items-center gap-1 text-sm text-gray-500">
                                                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                                            {product.store.rating.toFixed(1)}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end justify-between">
                                                    <span className="text-xl font-bold text-green-600">
                                                        {formatVND(product.price)}
                                                    </span>
                                                    <div className="flex gap-2">
                                                        <Link href={`/customer/marketplace/product/${product.id}`}>
                                                            <Button variant="outline" size="sm">
                                                                <Eye className="h-4 w-4 mr-1" />
                                                                Xem
                                                            </Button>
                                                        </Link>
                                                        <Button size="sm">
                                                            <ShoppingCart className="h-4 w-4 mr-1" />
                                                            Mua
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    )}
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {products.last_page > 1 && (
                            <div className="flex justify-center">
                                <div className="flex items-center gap-2">
                                    {products.links.map((link, index) => {
                                        // Handle previous/next buttons with icons
                                        if (link.label.includes('pagination.previous') || link.label.includes('&laquo;') || link.label.includes('Previous')) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 ${
                                                        link.url
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <ChevronLeft className="h-4 w-4" />
                                                </Link>
                                            );
                                        }
                                        
                                        if (link.label.includes('pagination.next') || link.label.includes('&raquo;') || link.label.includes('Next')) {
                                            return (
                                                <Link
                                                    key={index}
                                                    href={link.url || '#'}
                                                    className={`px-3 py-2 text-sm rounded-md flex items-center gap-1 ${
                                                        link.url
                                                            ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                    }`}
                                                >
                                                    <ChevronRight className="h-4 w-4" />
                                                </Link>
                                            );
                                        }
                                        
                                        // Handle regular page numbers
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url || '#'}
                                                className={`px-3 py-2 text-sm rounded-md ${
                                                    link.active
                                                        ? 'bg-blue-600 text-white'
                                                        : link.url
                                                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold mb-2">Không tìm thấy sản phẩm</h3>
                            <p className="text-gray-600 mb-6">
                                Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác
                            </p>
                            <Button onClick={clearFilters}>
                                Xóa bộ lọc
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
