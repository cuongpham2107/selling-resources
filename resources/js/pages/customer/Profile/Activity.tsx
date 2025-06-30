import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Activity, 
    ShoppingCart, 
    DollarSign, 
    CreditCard, 
    MessageSquare,
    Calendar,
    Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getRelativeTime } from '@/lib/date';
import type { Customer } from '@/types';

interface ActivityItem {
    id: number;
    type: 'purchase' | 'transaction' | 'payment' | 'message' | 'profile';
    title: string;
    description: string;
    amount?: number;
    status?: string;
    created_at: string;
}

interface ProfileActivityPageProps {
    customer: Customer;
    activities: {
        data: ActivityItem[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
}

export default function ProfileActivity({ activities }: ProfileActivityPageProps) {
    const [activeTab, setActiveTab] = useState('all');
    const [timeFilter, setTimeFilter] = useState('all');

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'purchase':
                return ShoppingCart;
            case 'transaction':
                return DollarSign;
            case 'payment':
                return CreditCard;
            case 'message':
                return MessageSquare;
            default:
                return Activity;
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'purchase':
                return 'text-green-600 bg-green-50';
            case 'transaction':
                return 'text-blue-600 bg-blue-50';
            case 'payment':
                return 'text-purple-600 bg-purple-50';
            case 'message':
                return 'text-yellow-600 bg-yellow-50';
            default:
                return 'text-gray-600 bg-gray-50';
        }
    };

    const getStatusBadgeVariant = (status?: string) => {
        switch (status) {
            case 'completed':
            case 'success':
                return 'default';
            case 'pending':
                return 'secondary';
            case 'failed':
            case 'cancelled':
                return 'destructive';
            default:
                return 'outline';
        }
    };

    const formatAmount = (amount?: number) => {
        if (!amount) return '';
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/profile">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Lịch sử hoạt động</h1>
                            <p className="text-gray-600">Theo dõi tất cả hoạt động của bạn</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Select value={timeFilter} onValueChange={setTimeFilter}>
                            <SelectTrigger className="w-40">
                                <Filter className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Lọc thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tất cả</SelectItem>
                                <SelectItem value="today">Hôm nay</SelectItem>
                                <SelectItem value="week">Tuần này</SelectItem>
                                <SelectItem value="month">Tháng này</SelectItem>
                                <SelectItem value="year">Năm này</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Activity Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <ShoppingCart className="w-4 h-4 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Giao dịch mua</p>
                                    <p className="text-xl font-bold">24</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <DollarSign className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Nạp tiền</p>
                                    <p className="text-xl font-bold">8</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-purple-50 rounded-lg">
                                    <CreditCard className="w-4 h-4 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Thanh toán</p>
                                    <p className="text-xl font-bold">32</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <div className="p-2 bg-yellow-50 rounded-lg">
                                    <MessageSquare className="w-4 h-4 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tin nhắn</p>
                                    <p className="text-xl font-bold">156</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Activity List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hoạt động gần đây</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList className="grid w-full grid-cols-5">
                                <TabsTrigger value="all">Tất cả</TabsTrigger>
                                <TabsTrigger value="purchase">Mua hàng</TabsTrigger>
                                <TabsTrigger value="transaction">Giao dịch</TabsTrigger>
                                <TabsTrigger value="payment">Thanh toán</TabsTrigger>
                                <TabsTrigger value="message">Tin nhắn</TabsTrigger>
                            </TabsList>
                            
                            <TabsContent value={activeTab} className="mt-6">
                                <div className="space-y-4">
                                    {activities.data.length > 0 ? activities.data.map((activity) => {
                                        const IconComponent = getActivityIcon(activity.type);
                                        const colorClass = getActivityColor(activity.type);
                                        
                                        return (
                                            <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                                                <div className={`p-2 rounded-lg ${colorClass}`}>
                                                    <IconComponent className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <h4 className="text-sm font-medium text-gray-900">
                                                            {activity.title}
                                                        </h4>
                                                        <div className="flex items-center space-x-2">
                                                            {activity.amount && (
                                                                <span className="text-sm font-medium text-gray-900">
                                                                    {formatAmount(activity.amount)}
                                                                </span>
                                                            )}
                                                            {activity.status && (
                                                                <Badge variant={getStatusBadgeVariant(activity.status)} className="text-xs">
                                                                    {activity.status}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {activity.description}
                                                    </p>
                                                    <div className="flex items-center space-x-2 mt-2">
                                                        <Calendar className="w-3 h-3 text-gray-400" />
                                                        <span className="text-xs text-gray-500">
                                                            {getRelativeTime(activity.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="text-center py-12">
                                            <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                Chưa có hoạt động
                                            </h3>
                                            <p className="text-gray-500">
                                                Hoạt động của bạn sẽ hiển thị ở đây khi bạn bắt đầu sử dụng dịch vụ.
                                            </p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Pagination */}
                                {activities.meta.last_page > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <p className="text-sm text-gray-700">
                                            Hiển thị {((activities.meta.current_page - 1) * activities.meta.per_page) + 1} đến{' '}
                                            {Math.min(activities.meta.current_page * activities.meta.per_page, activities.meta.total)} trong tổng số{' '}
                                            {activities.meta.total} kết quả
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            {activities.meta.current_page > 1 && (
                                                <Link href={`/customer/profile/activity?page=${activities.meta.current_page - 1}`}>
                                                    <Button variant="outline" size="sm">
                                                        Trước
                                                    </Button>
                                                </Link>
                                            )}
                                            {activities.meta.current_page < activities.meta.last_page && (
                                                <Link href={`/customer/profile/activity?page=${activities.meta.current_page + 1}`}>
                                                    <Button variant="outline" size="sm">
                                                        Sau
                                                    </Button>
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
