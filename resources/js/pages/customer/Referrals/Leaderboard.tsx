import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import {
    Trophy,
    Medal,
    Award,
    Users,
    Crown,
    Star,
    TrendingUp,
    Target
} from 'lucide-react';

interface TopReferrer {
    id: number;
    username: string;
    created_at: string;
    referrals_count: number;
    total_earnings: number;
}

interface Props {
    topReferrers: TopReferrer[];
    currentRank: number | null;
    currentEarnings: number;
}

export default function ReferralsLeaderboard({ topReferrers, currentRank, currentEarnings }: Props) {
    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Award className="h-5 w-5 text-orange-500" />;
            default:
                return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-500">#{rank}</span>;
        }
    };

    const getRankBadge = (rank: number) => {
        switch (rank) {
            case 1:
                return <Badge className="bg-yellow-100 text-yellow-800">🥇 Hạng 1</Badge>;
            case 2:
                return <Badge className="bg-gray-100 text-gray-800">🥈 Hạng 2</Badge>;
            case 3:
                return <Badge className="bg-orange-100 text-orange-800">🥉 Hạng 3</Badge>;
            default:
                return <Badge variant="outline">#{rank}</Badge>;
        }
    };

    const getCardStyle = (rank: number) => {
        switch (rank) {
            case 1:
                return "border-yellow-200 bg-yellow-50";
            case 2:
                return "border-gray-200 bg-gray-50";
            case 3:
                return "border-orange-200 bg-orange-50";
            default:
                return "";
        }
    };

    return (
        <CustomerLayout>
            <Head title="Bảng xếp hạng giới thiệu" />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Bảng xếp hạng giới thiệu</h1>
                        <p className="text-gray-600">
                            Xem những người giới thiệu hàng đầu và vị trí của bạn
                        </p>
                    </div>
                    <Link href={route('customer.referrals.index')}>
                        <Button variant="outline">
                            Quay lại
                        </Button>
                    </Link>
                </div>

                {/* Current User Stats */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-6 w-6" />
                            Vị trí của bạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {currentRank ? `#${currentRank}` : 'Chưa xếp hạng'}
                                </div>
                                <div className="text-blue-100">Xếp hạng hiện tại</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {currentEarnings.toLocaleString()}
                                </div>
                                <div className="text-blue-100">Điểm kiếm được</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">
                                    {topReferrers.length > 0 && currentRank 
                                        ? Math.max(0, topReferrers[0].total_earnings - currentEarnings).toLocaleString()
                                        : '0'
                                    }
                                </div>
                                <div className="text-blue-100">Điểm để lên hạng 1</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Top 3 Podium */}
                {topReferrers.length >= 3 && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="h-5 w-5 text-yellow-600" />
                                Top 3 xuất sắc nhất
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* 2nd Place */}
                                <div className="order-2 md:order-1">
                                    <Card className="border-gray-200 bg-gray-50">
                                        <CardContent className="p-6 text-center">
                                            <Medal className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                            <h3 className="font-bold text-lg mb-2">{topReferrers[1]?.username}</h3>
                                            <p className="text-2xl font-bold text-gray-600 mb-1">
                                                {topReferrers[1]?.total_earnings.toLocaleString()} điểm
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {topReferrers[1]?.referrals_count} giới thiệu
                                            </p>
                                            <Badge className="bg-gray-100 text-gray-800 mt-2">🥈 Hạng 2</Badge>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* 1st Place */}
                                <div className="order-1 md:order-2">
                                    <Card className="border-yellow-200 bg-yellow-50 transform md:scale-105">
                                        <CardContent className="p-6 text-center">
                                            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                                            <h3 className="font-bold text-xl mb-2">{topReferrers[0]?.username}</h3>
                                            <p className="text-3xl font-bold text-yellow-600 mb-1">
                                                {topReferrers[0]?.total_earnings.toLocaleString()} điểm
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {topReferrers[0]?.referrals_count} giới thiệu
                                            </p>
                                            <Badge className="bg-yellow-100 text-yellow-800 mt-2">🥇 Hạng 1</Badge>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* 3rd Place */}
                                <div className="order-3 md:order-3">
                                    <Card className="border-orange-200 bg-orange-50">
                                        <CardContent className="p-6 text-center">
                                            <Award className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                                            <h3 className="font-bold text-lg mb-2">{topReferrers[2]?.username}</h3>
                                            <p className="text-2xl font-bold text-orange-600 mb-1">
                                                {topReferrers[2]?.total_earnings.toLocaleString()} điểm
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                {topReferrers[2]?.referrals_count} giới thiệu
                                            </p>
                                            <Badge className="bg-orange-100 text-orange-800 mt-2">🥉 Hạng 3</Badge>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Full Leaderboard */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-blue-600" />
                            Bảng xếp hạng đầy đủ
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {topReferrers.length > 0 ? (
                            <div className="space-y-3">
                                {topReferrers.map((referrer, index) => {
                                    const rank = index + 1;
                                    return (
                                        <Card key={referrer.id} className={`${getCardStyle(rank)} transition-all hover:shadow-md`}>
                                            <CardContent className="p-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <div className="flex items-center justify-center w-10 h-10">
                                                            {getRankIcon(rank)}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold flex items-center gap-2">
                                                                {referrer.username}
                                                                {rank <= 3 && (
                                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                Tham gia: {formatDate(referrer.created_at)}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-bold text-lg">
                                                            {referrer.total_earnings.toLocaleString()} điểm
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {referrer.referrals_count} giới thiệu
                                                        </div>
                                                        {rank <= 3 && getRankBadge(rank)}
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Chưa có dữ liệu xếp hạng</h3>
                                <p className="text-gray-600 mb-4">
                                    Hãy bắt đầu giới thiệu để xuất hiện trong bảng xếp hạng
                                </p>
                                <Link href={route('customer.referrals.share')}>
                                    <Button>
                                        <Users className="h-4 w-4 mr-2" />
                                        Bắt đầu giới thiệu
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Competition Info */}
                <Card className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <Trophy className="h-12 w-12 text-purple-100" />
                            <div>
                                <h3 className="text-xl font-bold mb-2">Cuộc thi tháng này</h3>
                                <p className="text-purple-100 mb-3">
                                    Top 10 người giới thiệu nhiều nhất sẽ nhận thưởng đặc biệt!
                                </p>
                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div>
                                        <div className="text-lg font-bold">🥇 Hạng 1</div>
                                        <div className="text-sm text-purple-100">1.000 điểm</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">🥈 Hạng 2-3</div>
                                        <div className="text-sm text-purple-100">500 điểm</div>
                                    </div>
                                    <div>
                                        <div className="text-lg font-bold">🥉 Hạng 4-10</div>
                                        <div className="text-sm text-purple-100">200 điểm</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
