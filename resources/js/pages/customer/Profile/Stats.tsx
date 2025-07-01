import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { 
    ArrowLeft, 
    TrendingUp, 
    DollarSign, 
    ShoppingCart, 
    Calendar,
    Trophy,
    Star,
    Activity,
    Users,
    Target,
    Wallet,
    Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getRelativeTime } from '@/lib/date';
import type { Customer } from '@/types';

interface StatsData {
    overview: {
        total_spent: number;
        total_purchases: number;
        total_points_earned: number;
        total_points_spent: number;
        member_since: string;
        last_purchase: string;
    };
    monthly_stats: {
        month: string;
        spent: number;
        purchases: number;
        points_earned: number;
    }[];
    achievements: {
        id: number;
        title: string;
        description: string;
        icon: string;
        achieved_at: string;
        progress?: number;
        max_progress?: number;
    }[];
    rankings: {
        spending_rank: number;
        points_rank: number;
        total_customers: number;
    };
}

interface ProfileStatsPageProps {
    customer: Customer;
    stats: StatsData;
}

export default function ProfileStats({ customer, stats }: ProfileStatsPageProps) {
    const [timeRange, setTimeRange] = useState('month');
    const [activeTab, setActiveTab] = useState('overview');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const getAchievementIcon = (iconName: string) => {
        const icons: Record<string, React.ComponentType<{ className?: string }>> = {
            trophy: Trophy,
            star: Star,
            target: Target,
            gift: Gift,
            wallet: Wallet,
            users: Users
        };
        return icons[iconName] || Trophy;
    };

    const getRankBadgeColor = (rank: number, total: number) => {
        const percentage = (rank / total) * 100;
        if (percentage <= 10) return 'bg-yellow-500 text-white';
        if (percentage <= 25) return 'bg-gray-400 text-white';
        if (percentage <= 50) return 'bg-orange-500 text-white';
        return 'bg-gray-200 text-gray-700';
    };

    return (
        <CustomerLayout>
            <div className="mx-auto max-w-5xl space-y-6">
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
                            <h1 className="text-2xl font-bold text-gray-900">Thống kê tài khoản</h1>
                            <p className="text-gray-600">Xem chi tiết hoạt động và thành tích của bạn</p>
                        </div>
                    </div>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-40">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue placeholder="Chọn thời gian" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">Tuần này</SelectItem>
                            <SelectItem value="month">Tháng này</SelectItem>
                            <SelectItem value="quarter">Quý này</SelectItem>
                            <SelectItem value="year">Năm này</SelectItem>
                            <SelectItem value="all">Tất cả</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="overview">Tổng quan</TabsTrigger>
                        <TabsTrigger value="spending">Chi tiêu</TabsTrigger>
                        <TabsTrigger value="achievements">Thành tích</TabsTrigger>
                        <TabsTrigger value="rankings">Xếp hạng</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-6">
                        {/* Overview Stats */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Tổng chi tiêu</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatCurrency(stats.overview.total_spent)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <ShoppingCart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatNumber(stats.overview.total_purchases)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <Star className="w-5 h-5 text-yellow-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Điểm tích lũy</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {formatNumber(customer?.points?.available_points ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                            
                            <Card>
                                <CardContent className="p-6">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <Activity className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Thời gian tham gia</p>
                                            <p className="text-xl font-bold text-gray-900">
                                                {getRelativeTime(customer.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hoạt động gần đây</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Lần mua cuối</span>
                                        <span className="text-sm font-medium">
                                            {stats.overview.last_purchase ? 
                                                getRelativeTime(stats.overview.last_purchase) : 
                                                'Chưa có giao dịch'
                                            }
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Điểm đã sử dụng</span>
                                        <span className="text-sm font-medium">
                                            {formatNumber(stats.overview.total_points_spent)} điểm
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">Điểm đã kiếm</span>
                                        <span className="text-sm font-medium">
                                            {formatNumber(stats.overview.total_points_earned)} điểm
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="spending" className="space-y-6">
                        {/* Monthly Spending Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chi tiêu theo tháng</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {stats.monthly_stats.map((month, index) => (
                                        <div key={index} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">{month.month}</span>
                                                <span className="text-gray-600">
                                                    {formatCurrency(month.spent)} • {month.purchases} đơn hàng
                                                </span>
                                            </div>
                                            <Progress 
                                                value={(month.spent / Math.max(...stats.monthly_stats.map(m => m.spent))) * 100} 
                                                className="h-2"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Spending Categories */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh mục chi tiêu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center py-8">
                                    <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                    <p className="text-gray-500">Dữ liệu chi tiết sẽ được cập nhật sớm</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="achievements" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thành tích đã đạt được</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {stats.achievements.map((achievement) => {
                                        const IconComponent = getAchievementIcon(achievement.icon);
                                        const isCompleted = !achievement.max_progress || 
                                            (achievement.progress && achievement.progress >= achievement.max_progress);
                                        
                                        return (
                                            <div key={achievement.id} className={`p-4 border rounded-lg ${isCompleted ? 'border-yellow-200 bg-yellow-50' : 'border-gray-200'}`}>
                                                <div className="flex items-start space-x-3">
                                                    <div className={`p-2 rounded-lg ${isCompleted ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                                                        <IconComponent className="w-5 h-5" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-medium text-gray-900">
                                                                {achievement.title}
                                                            </h4>
                                                            {isCompleted && (
                                                                <Badge className="bg-yellow-500 text-white">
                                                                    Hoàn thành
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {achievement.description}
                                                        </p>
                                                        {achievement.max_progress && (
                                                            <div className="mt-3">
                                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                    <span>Tiến độ</span>
                                                                    <span>
                                                                        {achievement.progress}/{achievement.max_progress}
                                                                    </span>
                                                                </div>
                                                                <Progress 
                                                                    value={((achievement.progress || 0) / achievement.max_progress) * 100} 
                                                                    className="h-2"
                                                                />
                                                            </div>
                                                        )}
                                                        {isCompleted && (
                                                            <p className="text-xs text-yellow-600 mt-2">
                                                                Đạt được {getRelativeTime(achievement.achieved_at)}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                
                                {stats.achievements.length === 0 && (
                                    <div className="text-center py-12">
                                        <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Chưa có thành tích
                                        </h3>
                                        <p className="text-gray-500">
                                            Hãy tiếp tục sử dụng dịch vụ để mở khóa các thành tích mới!
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="rankings" className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                                        Xếp hạng chi tiêu
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center space-y-4">
                                        <div className="relative">
                                            <div className="text-4xl font-bold text-blue-600">
                                                #{stats.rankings.spending_rank}
                                            </div>
                                            <Badge 
                                                className={`mt-2 ${getRankBadgeColor(stats.rankings.spending_rank, stats.rankings.total_customers)}`}
                                            >
                                                Top {Math.round((stats.rankings.spending_rank / stats.rankings.total_customers) * 100)}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Trong tổng số {formatNumber(stats.rankings.total_customers)} khách hàng
                                        </p>
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium">
                                                Tổng chi tiêu: {formatCurrency(stats.overview.total_spent)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <Star className="w-5 h-5 mr-2 text-yellow-600" />
                                        Xếp hạng điểm số
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-center space-y-4">
                                        <div className="relative">
                                            <div className="text-4xl font-bold text-yellow-600">
                                                #{stats.rankings.points_rank}
                                            </div>
                                            <Badge 
                                                className={`mt-2 ${getRankBadgeColor(stats.rankings.points_rank, stats.rankings.total_customers)}`}
                                            >
                                                Top {Math.round((stats.rankings.points_rank / stats.rankings.total_customers) * 100)}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600">
                                            Trong tổng số {formatNumber(stats.rankings.total_customers)} khách hàng
                                        </p>
                                        <div className="pt-4 border-t">
                                            <p className="text-sm font-medium">
                                                Điểm hiện có: {formatNumber(customer?.points?.available_points ?? 0)}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </CustomerLayout>
    );
}
