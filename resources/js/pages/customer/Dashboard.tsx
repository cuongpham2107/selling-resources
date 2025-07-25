import React from 'react';
import { Link } from '@inertiajs/react';
import { 
    ArrowRightLeft, 
    Store, 
    Users, 
    AlertTriangle,
    Eye,
    DollarSign,
    ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import CustomerLayout from '@/layouts/CustomerLayout';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { formatVND, formatPoints } from '@/lib/currency';
import { formatDateTime, getRelativeTime } from '@/lib/date';
import { CustomerStats, IntermediateTransaction, StoreTransaction, Notification } from '@/types';
import { ResponsiveGrid } from '@/components/ui/responsive-container';
import { StatsCard } from '@/components/ui/responsive-card';
import { getStatusBadge } from '@/lib/config';

interface DashboardPageProps {
    stats: CustomerStats;
    recentTransactions: IntermediateTransaction[];
    recentStoreTransactions: StoreTransaction[];
    notifications: Notification[];
}

export default function CustomerDashboard({ 
    stats, 
    recentTransactions = [], 
    recentStoreTransactions = [],
    notifications = []
}: DashboardPageProps) {
    const { customer } = useCustomerAuth();

    const progressData = [
        {
            label: 'Giao dịch hoàn thành',
            value: stats.completed_transactions,
            total: stats.total_transactions,
            color: 'bg-green-600',
        },
        {
            label: 'Tỷ lệ thành công',
            value: stats.total_transactions > 0 ? Math.round((stats.completed_transactions / stats.total_transactions) * 100) : 0,
            total: 100,
            color: 'bg-blue-600',
            suffix: '%',
        },
    ];

    return (
        <CustomerLayout title="Trang chủ">
            <div className="space-y-4 sm:space-y-6 mx-auto max-w-7xl">
                {/* Welcome Section */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-4 sm:p-6 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex-1">
                            <h1 className="text-xl sm:text-2xl font-bold mb-2">
                                Chào mừng trở lại, {customer?.username}!
                            </h1>
                            <p className="text-blue-100 text-sm sm:text-base">
                                Hôm nay là một ngày tuyệt vời để thực hiện giao dịch an toàn
                            </p>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                            <div className="text-xs sm:text-sm text-blue-200">Số dư hiện tại</div>
                            <div className="text-xl sm:text-2xl font-bold">
                                {formatVND(stats.current_balance)}
                            </div>
                            <div className="text-xs sm:text-sm text-blue-200 mt-1">
                                {formatPoints(stats.current_points)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap="md">
                    <StatsCard
                        title="Tổng giao dịch"
                        value={stats.total_transactions}
                        icon={ArrowRightLeft}
                        iconColor="text-blue-600 dark:text-blue-400"
                    />

                    <StatsCard
                        title="Tổng chi tiêu"
                        value={formatVND(stats.total_spent)}
                        icon={DollarSign}
                        iconColor="text-red-600 dark:text-red-400"
                    />

                    <StatsCard
                        title="Doanh thu cửa hàng"
                        value={formatVND(stats.store_sales)}
                        icon={Store}
                        iconColor="text-green-600 dark:text-green-400"
                    />

                    <StatsCard
                        title="Lượt giới thiệu"
                        value={stats.referrals_count}
                        icon={Users}
                        iconColor="text-purple-600 dark:text-purple-400"
                    />
                </ResponsiveGrid>

                {/* Quick Actions */}
                {/* <Card>
                    <CardHeader>
                        <CardTitle>Thao tác nhanh</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {quickActions.map((action) => {
                                const Icon = action.icon;
                                return (
                                    <Link key={action.href} href={action.href}>
                                        <Button 
                                            variant="outline" 
                                            className="h-auto p-4 flex flex-col items-center text-center hover:bg-gray-50"
                                        >
                                            <div className={`h-12 w-12 rounded-full flex items-center justify-center mb-2 ${action.color}`}>
                                                <Icon className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <div className="font-medium">{action.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {action.description}
                                                </div>
                                            </div>
                                        </Button>
                                    </Link>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card> */}

                {/* Progress & Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hiệu suất giao dịch</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {progressData.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>{item.label}</span>
                                        <span className="font-medium">
                                            {item.value}/{item.total}{item.suffix || ''}
                                        </span>
                                    </div>
                                    <Progress 
                                        value={item.total === 0 ? 0 : (item.value / item.total) * 100}
                                        className="h-2"
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Thông báo gần đây
                                <Badge variant="destructive">
                                    {notifications.filter(n => !n.read_at).length}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {notifications.slice(0, 3).map((notification) => (
                                    <div key={notification.id} className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {getRelativeTime(notification.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {notifications.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Không có thông báo mới
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Giao dịch trung gian gần đây
                                <Link href="/customer/transactions">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Xem tất cả
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentTransactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between py-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                #{transaction.id} - {transaction.description}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDateTime(transaction.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end ml-4">
                                          
                                            {getStatusBadge(transaction.status)}
                                          
                                            <p className="text-sm font-medium mt-1">
                                                {formatVND(transaction.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentTransactions.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Chưa có giao dịch nào
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                Giao dịch cửa hàng gần đây
                                <Link href="/customer/store/transactions">
                                    <Button variant="outline" size="sm">
                                        <Eye className="h-4 w-4 mr-1" />
                                        Xem tất cả
                                    </Button>
                                </Link>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentStoreTransactions.slice(0, 5).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between py-2">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                <ShoppingBag className="h-3 w-3 inline mr-1" />
                                                {transaction.product?.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {formatDateTime(transaction.created_at)}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-end ml-4">
                                           
                                            {getStatusBadge(transaction.status)}
                                           
                                            <p className="text-sm font-medium mt-1">
                                                {formatVND(transaction.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                                {recentStoreTransactions.length === 0 && (
                                    <p className="text-sm text-gray-500 text-center py-4">
                                        Chưa có giao dịch cửa hàng nào
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
