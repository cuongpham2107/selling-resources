import React from 'react';
import { Link, Head } from '@inertiajs/react';
import { ArrowLeft, TrendingUp, Package, ShoppingCart, DollarSign, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/layouts/CustomerLayout';
import { formatDate } from '@/lib/date';
import type { PersonalStore } from '@/types';

interface AnalyticsData {
    total_products: number;
    total_sales: number;
    total_orders: number;
    recent_orders: Array<{
        id: number;
        product_name: string;
        buyer_username: string;
        amount: number;
        status: string;
        created_at: string;
    }>;
}

interface AnalyticsPageProps {
    store: PersonalStore;
    analytics: AnalyticsData;
}

export default function Analytics({ store, analytics }: AnalyticsPageProps) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return <Badge variant="default">Hoàn thành</Badge>;
            case 'pending':
                return <Badge variant="secondary">Chờ xử lý</Badge>;
            case 'cancelled':
                return <Badge variant="destructive">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <CustomerLayout>
            <Head title="Phân tích cửa hàng" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/customer/store">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <TrendingUp className="h-8 w-8" />
                            Phân tích - {store.store_name}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Xem thống kê và hiệu suất cửa hàng của bạn
                        </p>
                    </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng sản phẩm</p>
                                    <p className="text-3xl font-bold">{analytics.total_products}</p>
                                    <p className="text-xs text-gray-500 mt-1">Sản phẩm đang bán</p>
                                </div>
                                <Package className="h-8 w-8 text-blue-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
                                    <p className="text-3xl font-bold">{formatCurrency(analytics.total_sales)}</p>
                                    <p className="text-xs text-gray-500 mt-1">Từ trước đến nay</p>
                                </div>
                                <DollarSign className="h-8 w-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                    <p className="text-3xl font-bold">{analytics.total_orders}</p>
                                    <p className="text-xs text-gray-500 mt-1">Đơn đã hoàn thành</p>
                                </div>
                                <ShoppingCart className="h-8 w-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Giá trị trung bình</p>
                                    <p className="text-3xl font-bold">
                                        {analytics.total_orders > 0 
                                            ? formatCurrency(analytics.total_sales / analytics.total_orders)
                                            : formatCurrency(0)
                                        }
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">Mỗi đơn hàng</p>
                                </div>
                                <TrendingUp className="h-8 w-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Store Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Store Rating */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Đánh giá cửa hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-8">
                                <div className="text-4xl font-bold text-yellow-600 mb-2">
                                    {store.rating.toFixed(1)} / 5.0
                                </div>
                                <p className="text-gray-600">Đánh giá trung bình</p>
                                <div className="flex justify-center mt-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`text-2xl ${
                                                star <= store.rating ? 'text-yellow-400' : 'text-gray-300'
                                            }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Store Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Trạng thái cửa hàng
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Trạng thái hoạt động:</span>
                                <Badge variant={store.is_active ? 'default' : 'secondary'}>
                                    {store.is_active ? 'Đang hoạt động' : 'Tạm dừng'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Trạng thái xác minh:</span>
                                <Badge variant={store.is_verified ? 'default' : 'outline'}>
                                    {store.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Ngày tạo:</span>
                                <span className="text-sm">{formatDate(store.created_at)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Cập nhật cuối:</span>
                                <span className="text-sm">{formatDate(store.updated_at)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Đơn hàng gần đây
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {analytics.recent_orders.length > 0 ? (
                            <div className="space-y-4">
                                {analytics.recent_orders.map((order) => (
                                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <ShoppingCart className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold">{order.product_name}</h3>
                                                <p className="text-sm text-gray-600">
                                                    Khách hàng: {order.buyer_username}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatDate(order.created_at)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                {formatCurrency(order.amount)}
                                            </div>
                                            {getStatusBadge(order.status)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold mb-2">Chưa có đơn hàng nào</h3>
                                <p className="text-gray-600">
                                    Đơn hàng sẽ xuất hiện ở đây khi khách hàng mua sản phẩm của bạn.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hành động nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href={`/customer/store/${store.id}/products`}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Package className="h-4 w-4 mr-2" />
                                    Quản lý sản phẩm
                                </Button>
                            </Link>
                            <Link href={`/customer/store/${store.id}/edit`}>
                                <Button variant="outline" className="w-full justify-start">
                                    <Users className="h-4 w-4 mr-2" />
                                    Chỉnh sửa cửa hàng
                                </Button>
                            </Link>
                            <Link href="/customer/store/product/create">
                                <Button variant="outline" className="w-full justify-start">
                                    <Package className="h-4 w-4 mr-2" />
                                    Thêm sản phẩm mới
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
