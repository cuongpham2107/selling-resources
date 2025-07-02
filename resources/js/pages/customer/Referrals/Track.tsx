import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatDate } from '@/lib/date';
import {
    BarChart3,
    Calendar,
    TrendingUp,
    Users,
    Coins,
    Target,
    Download,
    // ArrowUpRight,
    // ArrowDownRight
} from 'lucide-react';

interface Referral {
    id: number;
    referrer_id: number;
    referred_id: number;
    status: string;
    created_at: string;
    referred: {
        id: number;
        username: string;
        created_at: string;
    };
}

interface DailyStat {
    date: string;
    referrals: number;
    earnings: number;
}

interface Props {
    period: string;
    referralsInPeriod: Referral[];
    earningsInPeriod: number;
    dailyStats: DailyStat[];
}

export default function ReferralsTrack({ period, referralsInPeriod, earningsInPeriod, dailyStats }: Props) {
    const handlePeriodChange = (newPeriod: string) => {
        router.get(route('customer.referrals.track'), { period: newPeriod });
    };

    const getPeriodLabel = (period: string) => {
        const labels = {
            week: 'Tuần này',
            month: 'Tháng này',
            quarter: 'Quý này',
            year: 'Năm này'
        };
        return labels[period as keyof typeof labels] || 'Tháng này';
    };

    const totalReferrals = referralsInPeriod.length;
    const activeReferrals = referralsInPeriod.filter(r => r.status === 'active').length;
    const averagePerDay = dailyStats.length > 0 
        ? totalReferrals / dailyStats.length 
        : 0;

    const maxReferrals = Math.max(...dailyStats.map(stat => stat.referrals));
    const maxEarnings = Math.max(...dailyStats.map(stat => stat.earnings));

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'inactive':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active':
                return 'Hoạt động';
            case 'pending':
                return 'Chờ xử lý';
            case 'inactive':
                return 'Không hoạt động';
            default:
                return 'Khác';
        }
    };

    // const getTrendIcon = (current: number, previous: number) => {
    //     if (current > previous) {
    //         return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    //     } else if (current < previous) {
    //         return <ArrowDownRight className="h-4 w-4 text-red-600" />;
    //     }
    //     return null;
    // };

    return (
        <CustomerLayout>
            <Head title="Theo dõi hiệu suất giới thiệu" />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Theo dõi hiệu suất</h1>
                        <p className="text-gray-600">
                            Phân tích chi tiết hoạt động giới thiệu của bạn
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-32">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="week">Tuần này</SelectItem>
                                <SelectItem value="month">Tháng này</SelectItem>
                                <SelectItem value="quarter">Quý này</SelectItem>
                                <SelectItem value="year">Năm này</SelectItem>
                            </SelectContent>
                        </Select>
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

                {/* Period Stats */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-6 w-6" />
                            Tổng quan {getPeriodLabel(period).toLowerCase()}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{totalReferrals}</div>
                                <div className="text-blue-100">Tổng giới thiệu</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{activeReferrals}</div>
                                <div className="text-blue-100">Đang hoạt động</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{earningsInPeriod.toLocaleString()}</div>
                                <div className="text-blue-100">Điểm kiếm được</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{averagePerDay.toFixed(1)}</div>
                                <div className="text-blue-100">Trung bình/ngày</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Referrals Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Giới thiệu theo ngày
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dailyStats.length > 0 ? (
                                <div className="space-y-3">
                                    {dailyStats.map((stat) => {
                                        const percentage = maxReferrals > 0 ? (stat.referrals / maxReferrals) * 100 : 0;
                                        return (
                                            <div key={stat.date} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {new Date(stat.date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {stat.referrals} người
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
                                    <p className="text-gray-600">Chưa có dữ liệu</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Earnings Chart */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5 text-yellow-600" />
                                Thu nhập theo ngày
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {dailyStats.length > 0 ? (
                                <div className="space-y-3">
                                    {dailyStats.map((stat) => {
                                        const percentage = maxEarnings > 0 ? (stat.earnings / maxEarnings) * 100 : 0;
                                        return (
                                            <div key={stat.date} className="space-y-1">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm font-medium">
                                                        {new Date(stat.date).toLocaleDateString('vi-VN')}
                                                    </span>
                                                    <span className="text-sm text-gray-600">
                                                        {stat.earnings.toLocaleString()} điểm
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300"
                                                        style={{ width: `${percentage}%` }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Chưa có dữ liệu</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Performance Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-green-600" />
                            Chỉ số hiệu suất
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="text-center p-4 border rounded-lg">
                                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                                <div className="text-lg font-bold">
                                    {activeReferrals > 0 ? ((activeReferrals / totalReferrals) * 100).toFixed(1) : 0}%
                                </div>
                                <div className="text-sm text-gray-600">Tỷ lệ chuyển đổi</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                                <div className="text-lg font-bold">
                                    {totalReferrals > 0 ? Math.round(earningsInPeriod / totalReferrals) : 0}
                                </div>
                                <div className="text-sm text-gray-600">Điểm/giới thiệu</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                                <div className="text-lg font-bold">
                                    {averagePerDay.toFixed(1)}
                                </div>
                                <div className="text-sm text-gray-600">Giới thiệu/ngày</div>
                            </div>
                            <div className="text-center p-4 border rounded-lg">
                                <Calendar className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                                <div className="text-lg font-bold">
                                    {Math.round(earningsInPeriod / (dailyStats.length || 1))}
                                </div>
                                <div className="text-sm text-gray-600">Điểm/ngày</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Referrals in Period */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Giới thiệu trong kỳ</CardTitle>
                            <Badge variant="outline">{totalReferrals} người</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {referralsInPeriod.length > 0 ? (
                            <div className="space-y-4">
                                {referralsInPeriod.slice(0, 10).map((referral) => (
                                    <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <Users className="h-5 w-5 text-blue-600" />
                                            <div>
                                                <div className="font-medium">{referral.referred.username}</div>
                                                <div className="text-sm text-gray-500">
                                                    Tham gia: {formatDate(referral.referred.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <Badge className={getStatusColor(referral.status)}>
                                                {getStatusLabel(referral.status)}
                                            </Badge>
                                            <div className="text-xs text-gray-500 mt-1">
                                                {formatDate(referral.created_at)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {referralsInPeriod.length > 10 && (
                                    <div className="text-center py-4">
                                        <p className="text-gray-500">
                                            và {referralsInPeriod.length - 10} người khác...
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Chưa có giới thiệu trong kỳ</h3>
                                <p className="text-gray-600 mb-4">
                                    Bắt đầu chia sẻ mã giới thiệu để có dữ liệu theo dõi
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
