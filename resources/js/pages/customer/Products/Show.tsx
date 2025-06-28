import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Trash2, Calendar, DollarSign, User } from 'lucide-react';
import { formatDate } from '@/lib/date';
import type { StoreProduct, Customer } from '@/types';

interface Analytics {
    total_sales: number;
    total_orders: number;
    recent_purchases: Array<{
        id: number;
        buyer: Customer;
        amount: number;
        created_at: string;
    }>;
}

interface Props {
    product: StoreProduct;
    analytics: Analytics;
}

export default function Show({ product, analytics }: Props) {
    const handleDelete = () => {
        if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            router.delete(route('customer.products.destroy', product.id));
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <CustomerLayout>
            <Head title={`Sản phẩm: ${product.name}`} />

            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <Link
                        href={route('customer.products.index')}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại danh sách sản phẩm
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Product Details */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle className="text-2xl">{product.name}</CardTitle>
                                        <CardDescription className="mt-2">
                                            {product.description}
                                        </CardDescription>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                            {product.is_active ? 'Đang bán' : 'Tạm ngưng'}
                                        </Badge>
                                        {product.is_sold && (
                                            <Badge variant="outline">Đã bán</Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {/* Product Images */}
                                {product.images && product.images.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Hình ảnh</h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {product.images.map((image, index) => (
                                                <img
                                                    key={index}
                                                    src={`/storage/${image}`}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-full h-32 object-cover rounded-lg border"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Product Content */}
                                {product.content && (
                                    <div className="space-y-2">
                                        <h3 className="text-lg font-semibold">Nội dung chi tiết</h3>
                                        <div className="prose max-w-none">
                                            <div className="whitespace-pre-wrap text-gray-700">
                                                {product.content}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Product Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                                    <div className="flex items-center space-x-2">
                                        <DollarSign className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Giá bán</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {formatCurrency(product.price)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Calendar className="w-5 h-5 text-gray-500" />
                                        <div>
                                            <p className="text-sm text-gray-500">Ngày tạo</p>
                                            <p className="text-sm font-medium">
                                                {formatDate(product.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Analytics & Actions */}
                    <div className="space-y-6">
                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link
                                    href={route('customer.products.edit', product.id)}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                                >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Chỉnh sửa
                                </Link>
                                
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    className="w-full"
                                    disabled={analytics.total_orders > 0}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Xóa sản phẩm
                                </Button>
                                
                                {analytics.total_orders > 0 && (
                                    <p className="text-xs text-gray-500">
                                        Không thể xóa sản phẩm đã có giao dịch
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        {/* Sales Analytics */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thống kê bán hàng</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4">
                                    <div className="text-center p-4 bg-green-50 rounded-lg">
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatCurrency(analytics.total_sales)}
                                        </p>
                                        <p className="text-sm text-gray-600">Tổng doanh thu</p>
                                    </div>
                                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                                        <p className="text-2xl font-bold text-blue-600">
                                            {analytics.total_orders}
                                        </p>
                                        <p className="text-sm text-gray-600">Đơn hàng đã bán</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Purchases */}
                        {analytics.recent_purchases.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Giao dịch gần đây</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics.recent_purchases.map((purchase) => (
                                            <div key={purchase.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <User className="w-4 h-4 text-gray-500" />
                                                    <div>
                                                        <p className="text-sm font-medium">
                                                            {purchase.buyer.username}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {formatDate(purchase.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <p className="text-sm font-semibold text-green-600">
                                                    {formatCurrency(purchase.amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
