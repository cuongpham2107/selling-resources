import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import ProductFilters from '@/components/Customer/ProductFilters';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { 
    ArrowLeft,
    Star,
    Store,
    Package,
    TrendingUp,
    Calendar,
    Eye,
    ShoppingCart,
    Verified
} from 'lucide-react';
import type { StoreProduct, PersonalStore } from '@/types';

interface StoreDetailProps {
    store: PersonalStore;
    products: {
        data: StoreProduct[];
        total: number;
        last_page: number;
        current_page: number;
        per_page: number;
        links: Array<{
            url?: string;
            label: string;
            active: boolean;
        }>;
    };
    storeStats: {
        total_products: number;
        total_sales: number;
        total_orders: number;
        member_since: string;
    };
    filters: {
        search: string;
        min_price: string;
        max_price: string;
        sort: string;
    };
}

export default function StoreDetail({ store, products, storeStats, filters }: StoreDetailProps) {
    const [viewMode, setViewMode] = React.useState<'grid' | 'list'>('grid');

    const clearFilters = () => {
        router.get(`/customer/marketplace/store/${store.id}`);
    };

    return (
        <CustomerLayout>
            <Head title={`${store.store_name} - Cửa hàng`} />
            
            <div className="space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/customer/marketplace" className="hover:text-blue-600">
                        Marketplace
                    </Link>
                    <span>›</span>
                    <span className="text-gray-900">{store.store_name}</span>
                </div>

                {/* Back button */}
                <Link href="/customer/marketplace">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại Marketplace
                    </Button>
                </Link>

                {/* Store Header */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Store Avatar */}
                            <div className="flex-shrink-0">
                                {store.avatar ? (
                                    <img 
                                        src={`/storage/${store.avatar}`}
                                        alt={store.store_name}
                                        className="w-24 h-24 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                                        <Store className="h-12 w-12 text-white" />
                                    </div>
                                )}
                            </div>

                            {/* Store Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold">{store.store_name}</h1>
                                    {store.is_verified && (
                                        <Verified className="h-6 w-6 text-blue-500" />
                                    )}
                                    <div className="flex items-center gap-1">
                                        <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                        <span className="font-semibold">{store.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <p className="text-gray-600 mb-4">{store.description}</p>

                                {/* Store Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
                                        <div className="text-xl font-bold">{storeStats.total_products}</div>
                                        <div className="text-sm text-gray-600">Sản phẩm</div>
                                    </div>
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-1" />
                                        <div className="text-xl font-bold">{formatVND(storeStats.total_sales)}</div>
                                        <div className="text-sm text-gray-600">Doanh số</div>
                                    </div>
                                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                                        <Eye className="h-6 w-6 text-purple-600 mx-auto mb-1" />
                                        <div className="text-xl font-bold">{storeStats.total_orders}</div>
                                        <div className="text-sm text-gray-600">Đơn hàng</div>
                                    </div>
                                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                                        <Calendar className="h-6 w-6 text-orange-600 mx-auto mb-1" />
                                        <div className="text-sm font-bold">{formatDate(storeStats.member_since)}</div>
                                        <div className="text-sm text-gray-600">Thành viên từ</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Search and Filters - Replaced with ProductFilters component */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <span>Sản phẩm trong cửa hàng</span>
                            <ProductFilters
                                filters={filters}
                                viewMode={viewMode}
                                onViewModeChange={setViewMode}
                                searchUrl={`/customer/marketplace/store/${store.id}`}
                                showStoreFilter={false}
                                triggerButton={
                                    <Button variant="outline">
                                        Tìm kiếm & Lọc
                                    </Button>
                                }
                            />
                        </CardTitle>
                    </CardHeader>
                </Card>

                {/* Products */}
                {products.data.length > 0 ? (
                    <div className="space-y-4">
                        {/* Results Info */}
                        <div className="flex justify-between items-center">
                            <p className="text-gray-600">
                                Hiển thị {((products.current_page - 1) * products.per_page) + 1}-{Math.min(products.current_page * products.per_page, products.total)} 
                                trong {products.total} sản phẩm
                            </p>
                        </div>

                        {/* Products Grid/List */}
                        <div className={viewMode === 'grid' 
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
                            : "space-y-4"
                        }>
                            {products.data.map((product) => (
                                <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
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
                                            </div>
                                            <CardContent className="p-4">
                                                <div className="space-y-2">
                                                    <h3 className="font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                        {product.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {product.description}
                                                    </p>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-lg font-bold text-green-600">
                                                            {formatVND(product.price)}
                                                        </span>
                                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                            {product.is_active ? 'Có sẵn' : 'Tạm ngưng'}
                                                        </Badge>
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
                                                        {product.is_active && !product.is_sold && (
                                                            <Button size="sm" className="flex-1">
                                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                                Mua
                                                            </Button>
                                                        )}
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
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                            {product.is_active ? 'Có sẵn' : 'Tạm ngưng'}
                                                        </Badge>
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
                                                        {product.is_active && !product.is_sold && (
                                                            <Button size="sm">
                                                                <ShoppingCart className="h-4 w-4 mr-1" />
                                                                Mua
                                                            </Button>
                                                        )}
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
                                    {products.links.map((link, index) => (
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
                                    ))}
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
                                Cửa hàng này chưa có sản phẩm nào hoặc không khớp với bộ lọc của bạn
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
