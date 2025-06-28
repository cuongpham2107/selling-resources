import React from 'react';
import { Link, Head } from '@inertiajs/react';
import { ArrowLeft, Plus, Package, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/layouts/CustomerLayout';
import type { PersonalStore, StoreProduct } from '@/types';

interface ProductsPageProps {
    store: PersonalStore;
    products: {
        data: StoreProduct[];
        total: number;
        last_page: number;
        links: Array<{
            url?: string;
            label: string;
            active: boolean;
        }>;
    };
}

export default function Products({ store, products }: ProductsPageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    return (
        <CustomerLayout>
            <Head title="Sản phẩm cửa hàng" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/customer/store">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Package className="h-8 w-8" />
                                Sản phẩm - {store.store_name}
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Quản lý sản phẩm trong cửa hàng của bạn
                            </p>
                        </div>
                    </div>
                    <Link href="/customer/store/product/create">
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Thêm sản phẩm
                        </Button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                                    <p className="text-2xl font-bold">{products.total}</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sản phẩm đang bán</p>
                                    <p className="text-2xl font-bold">
                                        {products.data.filter(p => p.is_active).length}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sản phẩm tạm dừng</p>
                                    <p className="text-2xl font-bold">
                                        {products.data.filter(p => !p.is_active).length}
                                    </p>
                                </div>
                                <Package className="h-8 w-8 text-red-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Products List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách sản phẩm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {products.data.length > 0 ? (
                            <div className="space-y-4">
                                {products.data.map((product) => (
                                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            {product.images && product.images.length > 0 ? (
                                                <img 
                                                    src={`/storage/${product.images[0]}`}
                                                    alt={product.name}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                            <div>
                                                <h3 className="font-semibold">{product.name}</h3>
                                                <p className="text-gray-600 text-sm">
                                                    {product.description?.substring(0, 100)}...
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="font-medium text-blue-600">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                                        {product.is_active ? 'Đang bán' : 'Tạm dừng'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Link href={`/customer/store/product/${product.id}`}>
                                                <Button variant="ghost" size="sm">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Link href={`/customer/store/product/${product.id}/edit`}>
                                                <Button variant="ghost" size="sm">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Chưa có sản phẩm nào</h3>
                                <p className="text-gray-600 mb-6">
                                    Bắt đầu bán hàng bằng cách thêm sản phẩm đầu tiên của bạn.
                                </p>
                                <Link href="/customer/store/product/create">
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm sản phẩm đầu tiên
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex justify-center gap-2">
                        {products.links.map((link, index) => (
                            <Link
                                key={index}
                                href={link.url || '#'}
                                className={`px-4 py-2 rounded-md ${
                                    link.active 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
