import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import {
    TrendingUp,
    Calendar,
    Coins,
    Users,
    ArrowUpRight,
    Download,
    Filter,
    BarChart3
} from 'lucide-react';

interface PointTransaction {
    id: number;
    customer_id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
}

interface MonthlyEarning {
    month: string;
    total: number;
}

interface Props {
    earnings: {
        data: PointTransaction[];
        total: number;
        current_page: number;
        last_page: number;
        links: Array<{
            url?: string;
            label: string;
            active: boolean;
        }>;
    };
    monthlyEarnings: MonthlyEarning[];
}

export default function ReferralsEarnings({ earnings, monthlyEarnings }: Props) {
    const totalEarnings = earnings.data.reduce((sum, earning) => sum + earning.amount, 0);
    const currentMonthEarnings = monthlyEarnings[0]?.total || 0;
    const previousMonthEarnings = monthlyEarnings[1]?.total || 0;
    const monthlyGrowth = previousMonthEarnings > 0 
        ? ((currentMonthEarnings - previousMonthEarnings) / previousMonthEarnings) * 100 
        : 0;

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'referral_bonus':
                return <Users className="h-4 w-4 text-green-600" />;
            default:
                return <Coins className="h-4 w-4 text-blue-600" />;
        }
    };

    const getTransactionDescription = (description: string) => {
        if (description.includes('referral_bonus')) {
            return 'Thưởng giới thiệu';
        }
        return description;
    };

    return (
        <CustomerLayout>
            <Head title="Thu nhập từ giới thiệu" />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Thu nhập từ giới thiệu</h1>
                        <p className="text-gray-600">
                            Theo dõi tất cả điểm kiếm được từ chương trình giới thiệu
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" disabled>
                            <Download className="h-4 w-4 mr-2" />
                            Xuất báo cáo
                        </Button>
                        <Link href={route('customer.referrals.index')}>
                            <Button variant="outline">
                                Quay lại
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Coins className="h-4 w-4 text-yellow-600" />
                                Tổng thu nhập
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-yellow-600">
                                {totalEarnings.toLocaleString()} điểm
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Từ {earnings.total} giao dịch
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Tháng này
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {currentMonthEarnings.toLocaleString()} điểm
                            </div>
                            {monthlyGrowth !== 0 && (
                                <div className={`flex items-center gap-1 text-xs mt-1 ${
                                    monthlyGrowth > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                    <ArrowUpRight className={`h-3 w-3 ${
                                        monthlyGrowth < 0 ? 'rotate-90' : ''
                                    }`} />
                                    {Math.abs(monthlyGrowth).toFixed(1)}% so với tháng trước
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Trung bình/tháng
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                {monthlyEarnings.length > 0 
                                    ? Math.round(monthlyEarnings.reduce((sum, m) => sum + m.total, 0) / monthlyEarnings.length).toLocaleString()
                                    : 0
                                } điểm
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Trong {monthlyEarnings.length} tháng qua
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Monthly Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Thu nhập theo tháng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {monthlyEarnings.length > 0 ? (
                            <div className="space-y-4">
                                {monthlyEarnings.map((earning) => {
                                    const maxValue = Math.max(...monthlyEarnings.map(e => e.total));
                                    const percentage = maxValue > 0 ? (earning.total / maxValue) * 100 : 0;
                                    
                                    return (
                                        <div key={earning.month} className="space-y-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sm font-medium">
                                                    Tháng {earning.month}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {earning.total.toLocaleString()} điểm
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-600">Chưa có dữ liệu thu nhập</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Earnings History */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Lịch sử thu nhập</CardTitle>
                            <Button variant="outline" size="sm" disabled>
                                <Filter className="h-4 w-4 mr-2" />
                                Lọc
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {earnings.data.length > 0 ? (
                            <div className="space-y-4">
                                {earnings.data.map((earning) => (
                                    <div key={earning.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getTransactionIcon(earning.type)}
                                            <div>
                                                <div className="font-medium">
                                                    {getTransactionDescription(earning.description)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(earning.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-semibold text-green-600">
                                                +{earning.amount.toLocaleString()} điểm
                                            </div>
                                            <Badge variant="outline" className="text-xs">
                                                {earning.type === 'referral_bonus' ? 'Giới thiệu' : 'Khác'}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}

                                {/* Pagination */}
                                {earnings.last_page > 1 && (
                                    <div className="flex justify-center gap-2 mt-6">
                                        {earnings.links.map((link, index) => (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                disabled={!link.url}
                                                className="min-w-[40px]"
                                            >
                                                <span dangerouslySetInnerHTML={{ __html: link.label }} />
                                            </Button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Chưa có thu nhập</h3>
                                <p className="text-gray-600 mb-4">
                                    Bắt đầu giới thiệu bạn bè để kiếm điểm thưởng
                                </p>
                                <Link href={route('customer.referrals.share')}>
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Chia sẻ ngay
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
