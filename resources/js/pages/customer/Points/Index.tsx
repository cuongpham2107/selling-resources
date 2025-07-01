import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import { Star, ArrowUpDown, Gift, Trophy, History, Plus, Minus } from 'lucide-react';
import type { CustomerPoint, PointTransaction } from '@/types';

interface PaginatedPointTransactions {
    data: PointTransaction[];
    total: number;
    last_page: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    points: CustomerPoint | null;
    recentTransactions: PaginatedPointTransactions;
    exchangeRate: number;
}

export default function PointsIndex({ points, recentTransactions, exchangeRate }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'earned':
            case 'exchange_in':
                return <Plus className="h-4 w-4 text-green-600" />;
            case 'spent':
            case 'exchange_out':
                return <Minus className="h-4 w-4 text-red-600" />;
            default:
                return <Star className="h-4 w-4 text-yellow-600" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'earned':
            case 'exchange_in':
                return 'text-green-600';
            case 'spent':
            case 'exchange_out':
                return 'text-red-600';
            default:
                return 'text-yellow-600';
        }
    };

    return (
        <CustomerLayout>
            <Head title="Điểm của tôi" />

            <div className="space-y-6 mx-auto max-w-4xl ">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Điểm của tôi</h1>
                        <p className="text-gray-600">
                            Kiếm điểm, tiêu điểm và đổi điểm để nhận phần thưởng
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('customer.points.history')}>
                            <Button variant="outline">
                                <History className="h-4 w-4 mr-2" />
                                Lịch sử
                            </Button>
                        </Link>
                    </div>
                </div>


                {/* Points Balance Card */}
                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-6 w-6" />
                            Số dư điểm
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className='flex flex-col items-center'>
                                <div className="text-3xl font-bold">
                                    {(points?.available_points || 0).toLocaleString()}
                                </div>
                                <div className="text-yellow-100">Điểm khả dụng</div>
                                <div className="text-sm text-yellow-200 mt-1">
                                    ≈ {formatCurrency((points?.available_points || 0) * exchangeRate)}
                                </div>
                            </div>

                            <div className='flex flex-col items-center'>
                                <div className="text-2xl font-semibold">
                                    {(points?.total_earned || 0).toLocaleString()}
                                </div>
                                <div className="text-yellow-100">Tổng điểm kiếm được</div>
                            </div>

                            <div className='flex flex-col items-center'>
                                <div className="text-2xl font-semibold">
                                    {(points?.total_spent || 0).toLocaleString()}
                                </div>
                                <div className="text-yellow-100">Tổng điểm đã tiêu</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Exchange Rate Info */}
                <Card className="h-full flex-1 bg-blue-50 border-blue-200 col-span-1 md:col-span-1">
                    <CardContent className="p-4 ">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <ArrowUpDown className="h-5 w-5 text-blue-600" />
                                <span className="font-medium">Tỷ lệ đổi điểm</span>
                            </div>
                            <div className="text-right">
                                <div className="font-semibold">1 Điểm = {formatCurrency(exchangeRate)}</div>
                                <div className="text-sm text-gray-600">1.000 VND = 1 Điểm</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.points.earn')}>
                            <CardContent className="p-6 text-center">
                                <Trophy className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Kiếm điểm</h3>
                                <p className="text-sm text-gray-600">
                                    Hoàn thành các nhiệm vụ để kiếm thêm điểm
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.points.exchange')}>
                            <CardContent className="p-6 text-center">
                                <ArrowUpDown className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Đổi điểm</h3>
                                <p className="text-sm text-gray-600">
                                    Chuyển đổi giữa điểm và số dư
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.points.spend')}>
                            <CardContent className="p-6 text-center">
                                <Gift className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Tiêu điểm</h3>
                                <p className="text-sm text-gray-600">
                                    Đổi điểm lấy phần thưởng và ưu đãi
                                </p>
                            </CardContent>
                        </Link>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Giao dịch điểm gần đây</CardTitle>
                            <Link href={route('customer.points.history')}>
                                <Button variant="ghost" size="sm">
                                    Xem tất cả
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.data.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.data.slice(0, 10).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getTransactionIcon(transaction.type)}
                                            <div>
                                                <div className="font-medium">{transaction.description}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                                {transaction.amount > 0 ? '+' : ''}
                                                {(transaction.amount || 0).toLocaleString()} điểm
                                            </div>
                                            <div className="text-xs text-gray-500 capitalize">
                                                {transaction.type.replace('_', ' ')}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch điểm nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Bắt đầu kiếm điểm bằng cách hoàn thành nhiệm vụ và thực hiện giao dịch.
                                </p>
                                <Link href={route('customer.points.earn')}>
                                    <Button>
                                        <Trophy className="h-4 w-4 mr-2" />
                                        Bắt đầu kiếm điểm
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
