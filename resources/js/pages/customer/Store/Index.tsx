import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Store, Plus, Settings, BarChart, Package } from 'lucide-react';
import type { PersonalStore } from '@/types';

interface Props {
    store: PersonalStore | null;
    hasStore: boolean;
}

export default function StoreIndex({ store, hasStore }: Props) {
    return (
        <CustomerLayout>
            <Head title="Cửa hàng của bạn" />

            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Cửa hàng của bạn</h1>
                        <p className="text-gray-600">
                            Quản lý cửa hàng trực tuyến của bạn
                        </p>
                    </div>
                    {hasStore ? (
                        <div className="flex gap-2">
                            <Link href={route('customer.store.analytics', store!.id)}>
                                <Button variant="outline">
                                    <BarChart className="h-4 w-4 mr-2" />
                                    Phân Tích
                                </Button>
                            </Link>
                            <Link href={route('customer.store.edit', store!.id)}>
                                <Button variant="outline">
                                    <Settings className="h-4 w-4 mr-2" />
                                    Cài Đặt
                                </Button>
                            </Link>
                            <Link href={route('customer.products.index')}>
                                <Button>
                                    <Package className="h-4 w-4 mr-2" />
                                    Quản Lý Sản Phẩm
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Link href={route('customer.store.create')}>
                            <Button>
                                <Plus className="h-4 w-4 mr-2" />
                                Tạo Cửa Hàng
                            </Button>
                        </Link>
                    )}
                </div>

                {hasStore && store ? (
                    <>
                        {/* Store Overview */}
                        <Card>
                            <CardHeader>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        {store.avatar && (
                                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                <img 
                                                    src={`/storage/${store.avatar}`} 
                                                    alt={store.store_name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <div>
                                            <CardTitle className="text-2xl">{store.store_name}</CardTitle>
                                            <CardDescription className="mt-1">
                                                {store.description}
                                            </CardDescription>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <Badge variant={store.is_active ? 'default' : 'secondary'}>
                                            {store.is_active ? 'Hoạt Động' : 'Không Hoạt Động'}
                                        </Badge>
                                        {store.is_verified && (
                                            <Badge variant="default" className="bg-green-100 text-green-800">
                                                Đã Xác Thực
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{store.products?.length}</div>
                                        <div className="text-sm text-gray-600">Sản Phẩm</div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <div className="text-2xl font-bold text-green-600">{store.total_sales}</div>
                                        <div className="text-sm text-gray-600">Đơn Hàng</div>
                                    </div>
                                    <div className="p-4 bg-yellow-50 rounded-lg">
                                        <div className="text-2xl font-bold text-yellow-600">{store.rating}</div>
                                        <div className="text-sm text-gray-600">Đánh Giá</div>
                                    </div>
                                    <div className="p-4 bg-purple-50 rounded-lg">
                                        <div className="text-2xl font-bold text-purple-600">
                                            {new Date(store.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-sm text-gray-600">Thành Lập</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <Link href={route('customer.products.create')}>
                                    <CardContent className="p-6 text-center">
                                        <Package className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Thêm Sản Phẩm</h3>
                                        <p className="text-sm text-gray-600">
                                            Thêm sản phẩm mới vào cửa hàng của bạn
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <Link href={route('customer.store.analytics', store.id)}>
                                    <CardContent className="p-6 text-center">
                                        <BarChart className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Xem Phân Tích</h3>
                                        <p className="text-sm text-gray-600">
                                            Theo dõi hiệu suất cửa hàng của bạn
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>

                            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                                <Link href={route('customer.store.edit', store.id)}>
                                    <CardContent className="p-6 text-center">
                                        <Settings className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                                        <h3 className="font-semibold mb-2">Cài Đặt Cửa Hàng</h3>
                                        <p className="text-sm text-gray-600">
                                            Tùy chỉnh cài đặt cửa hàng của bạn
                                        </p>
                                    </CardContent>
                                </Link>
                            </Card>
                        </div>
                    </>
                ) : (
                    /* No Store Yet */
                    <Card>
                        <CardContent className="py-16 text-center">
                            <Store className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                            <h2 className="text-2xl font-bold mb-4">Tạo Cửa Hàng Của Bạn</h2>
                            <p className="text-gray-600 mb-8 max-w-md mx-auto">
                                Bắt đầu bán sản phẩm của bạn bằng cách tạo cửa hàng trực tuyến riêng.
                                Dễ dàng thiết lập và hoàn toàn miễn phí!
                            </p>
                            
                            <div className="space-y-4 max-w-lg mx-auto mb-8">
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">1</span>
                                    </div>
                                    <span className="text-gray-700">Chọn tên và mô tả cửa hàng của bạn</span>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">2</span>
                                    </div>
                                    <span className="text-gray-700">Tải lên logo và banner (tùy chọn)</span>
                                </div>
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                        <span className="text-blue-600 font-semibold text-sm">3</span>
                                    </div>
                                    <span className="text-gray-700">Bắt đầu thêm sản phẩm của bạn</span>
                                </div>
                            </div>

                            <Link href={route('customer.store.create')}>
                                <Button size="lg">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Tạo Cửa Hàng Của Tôi
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
