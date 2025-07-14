import React, { useState } from 'react';
import { Users, Copy, Share2, Gift, TrendingUp, Calendar, DollarSign, CheckCircle, Dot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerLayout from '@/layouts/CustomerLayout';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import type { Customer } from '@/types';

interface ReferralsIndexPageProps {
    referral_code: string;
    referral_url: string;
    referral_stats: {
        total_referrals: number;
        active_referrals: number;
        total_earnings: number;
        pending_earnings: number;
    };
    referred_customers: {
        data: Array<{
            id: number;
            referrer_id: number;
            referred_id: number;
            total_points_earned: number;
            successful_transactions: number;
            first_transaction_at: string | null;
            created_at: string;
            updated_at: string;
            status: string;
            referred: {
                id: number;
                username: string;
                email?: string;
                created_at: string;
            };
        }>;
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    referral_earnings: Array<{
        id: number;
        customer_id: number;
        type: string;
        amount: number;
        balance_after: number;
        related_transaction_type: string | null;
        related_transaction_id: number | null;
        related_customer_id: number | null;
        description: string | null;
        created_at: string;
        updated_at: string;
        relatedCustomer?: Customer;
        related_customer?: Customer;
    }>;
}

export default function ReferralsIndex({ 
    referral_code, 
    referral_url, 
    referral_stats, 
    referred_customers, 
    referral_earnings 
}: ReferralsIndexPageProps) {
    const [copying, setCopying] = useState(false);
    const [copied, setCopied] = useState(false);
    console.log(referred_customers)
    const handleCopyCode = async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(referral_code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        } finally {
            setCopying(false);
        }
    };

    const handleCopyUrl = async () => {
        setCopying(true);
        try {
            await navigator.clipboard.writeText(referral_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        } finally {
            setCopying(false);
        }
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Tham gia cùng tôi!',
                    text: `Sử dụng mã giới thiệu ${referral_code} để nhận ưu đãi đặc biệt!`,
                    url: referral_url,
                });
            } catch (error) {
                console.error('Failed to share:', error);
            }
        } else {
            handleCopyUrl();
        }
    };

    return (
        <CustomerLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                        <Users className="w-6 h-6 mr-2" />
                        Chương trình giới thiệu
                    </h1>
                    <p className="text-gray-600">Giới thiệu bạn bè và nhận phần thưởng</p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Users className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng giới thiệu</p>
                                    <p className="text-2xl font-bold">{referral_stats.total_referrals}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <TrendingUp className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                                    <p className="text-2xl font-bold">{referral_stats.active_referrals}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Dot className="w-8 h-8 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng thu nhập</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {referral_stats.total_earnings} điểm
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Gift className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang chờ</p>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatVND(referral_stats.pending_earnings)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Referral Code and URL */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mã và liên kết giới thiệu của bạn</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {copied && (
                            <Alert>
                                <CheckCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Đã sao chép vào clipboard!
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Referral Code */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Mã giới thiệu
                            </label>
                            <div className="flex space-x-2">
                                <Input
                                    value={referral_code}
                                    readOnly
                                    className="flex-1 font-mono bg-gray-50"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleCopyCode}
                                    disabled={copying}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Sao chép
                                </Button>
                            </div>
                        </div>

                        {/* Referral URL */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 mb-2 block">
                                Liên kết giới thiệu
                            </label>
                            <div className="flex space-x-2">
                                <Input
                                    value={referral_url}
                                    readOnly
                                    className="flex-1 font-mono bg-gray-50 text-sm"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleCopyUrl}
                                    disabled={copying}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Sao chép
                                </Button>
                                <Button onClick={handleShare}>
                                    <Share2 className="w-4 h-4 mr-2" />
                                    Chia sẻ
                                </Button>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-medium text-blue-900 mb-2">Cách thức hoạt động:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Chia sẻ mã hoặc liên kết giới thiệu với bạn bè</li>
                                <li>• Bạn bè đăng ký tài khoản sử dụng mã của bạn</li>
                                <li>• Bạn nhận được hoa hồng khi họ thực hiện giao dịch</li>
                                <li>• Hoa hồng sẽ được cộng vào tài khoản điểm của bạn</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>

                {/* Tabs for Referrals and Earnings */}
                <Tabs defaultValue="referrals" className="space-y-4">
                    <TabsList>
                        <TabsTrigger value="referrals">Người được giới thiệu</TabsTrigger>
                        <TabsTrigger value="earnings">Lịch sử thu nhập</TabsTrigger>
                    </TabsList>

                    {/* Referred Customers Tab */}
                    <TabsContent value="referrals">
                        <Card>
                            <CardHeader>
                                <CardTitle>Danh sách người được giới thiệu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {referred_customers.data.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Chưa có người được giới thiệu
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Bắt đầu chia sẻ mã giới thiệu để nhận phần thưởng
                                        </p>
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                                            <p className="text-sm text-blue-800">
                                                💡 <strong>Mẹo:</strong> Chia sẻ mã giới thiệu trên mạng xã hội hoặc gửi cho bạn bè để tăng cơ hội nhận thưởng!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                            <p className="text-sm text-yellow-800">
                                                📱 <strong>Lưu ý:</strong> Bảng có thể cuộn ngang trên thiết bị di động để xem đầy đủ thông tin.
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Tên đăng nhập</TableHead>
                                                    <TableHead>Email</TableHead>
                                                    <TableHead>Trạng thái</TableHead>
                                                    <TableHead>Ngày tham gia</TableHead>
                                                    <TableHead>Giao dịch thành công</TableHead>
                                                    <TableHead>Giao dịch đầu tiên</TableHead>
                                                    <TableHead>Thu nhập từ người này</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {referred_customers.data.map((referral) => {
                                                    return (
                                                        <TableRow key={referral.id}>
                                                            <TableCell className="font-medium">
                                                                {referral.referred.username}
                                                            </TableCell>
                                                            <TableCell>
                                                                {referral.referred.email || 'N/A'}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge 
                                                                    variant="outline" 
                                                                    className={
                                                                        referral.status === 'active' 
                                                                            ? 'bg-green-50 text-green-700 border-green-200'
                                                                            : 'bg-gray-50 text-gray-700 border-gray-200'
                                                                    }
                                                                >
                                                                    {referral.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex items-center">
                                                                    <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                                    {formatDate(referral.referred.created_at)}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell className="text-center">
                                                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                    {referral.successful_transactions}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {referral.first_transaction_at ? (
                                                                    <div className="flex items-center">
                                                                        <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                                        {formatDate(referral.first_transaction_at)}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-gray-500 text-sm">Chưa có</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="font-semibold text-green-600">
                                                                {formatVND(referral.total_points_earned)}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Earnings History Tab */}
                    <TabsContent value="earnings">
                        <Card>
                            <CardHeader>
                                <CardTitle>Lịch sử thu nhập giới thiệu</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {referral_earnings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                                            Chưa có thu nhập nào
                                        </h3>
                                        <p className="text-gray-600 mb-4">
                                            Thu nhập từ thưởng giới thiệu sẽ hiển thị ở đây
                                        </p>
                                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                                            <p className="text-sm text-green-800">
                                                💰 <strong>Lưu ý:</strong> Bạn sẽ nhận thưởng điểm khi người được giới thiệu thực hiện giao dịch thành công!
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800">
                                                🎉 <strong>Tuyệt vời!</strong> Bạn đã nhận được {referral_earnings.length} thưởng giới thiệu. Tiếp tục chia sẻ để nhận thêm thưởng!
                                            </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead>Người được giới thiệu</TableHead>
                                                    <TableHead>Thưởng nhận được</TableHead>
                                                    {/* <TableHead>Trạng thái</TableHead> */}
                                                    <TableHead>Ngày nhận thưởng</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {referral_earnings.map((earning) => (
                                                    <TableRow key={earning.id}>
                                                        <TableCell className="font-medium">
                                                            {earning.related_customer?.username || earning.relatedCustomer?.username || `ID: ${earning.related_customer_id || 'N/A'}`}
                                                        </TableCell>
                                                        <TableCell className="font-semibold text-green-600">
                                                            +{earning.amount.toLocaleString()} điểm
                                                        </TableCell>
                                                        {/* <TableCell>
                                                            <Badge 
                                                                variant="outline" 
                                                                className="bg-green-50 text-green-700 border-green-200"
                                                            >
                                                                Đã xác nhận
                                                            </Badge>
                                                        </TableCell> */}
                                                        <TableCell>
                                                            <div className="flex items-center">
                                                                <Calendar className="w-3 h-3 mr-1 text-gray-400" />
                                                                {formatDate(earning.created_at)}
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </CustomerLayout>
    );
}
