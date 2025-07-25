import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ArrowLeft, 
    MessageSquareOff, 
    Clock, 
    CheckCircle,
    AlertTriangle,
    Package,
    Info
} from 'lucide-react';
import { getStatusBadge } from '@/lib/config';

interface ChatNotAvailableProps {
    transaction: {
        id: number;
        transaction_code: string;
        status: string;
        status_color: string;
        can_be_confirmed: boolean;
        is_seller: boolean;
    };
    message: string;
}

export default function ChatNotAvailable({ transaction, message }: ChatNotAvailableProps) {
   
    return (
        <CustomerLayout>
            <Head title={`Chat không khả dụng - Giao dịch #${transaction.id}`} />

            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/chat/transaction">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại danh sách
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chat không khả dụng
                            </h1>
                            <p className="text-gray-600">
                                Giao dịch #{transaction.id} - {transaction.transaction_code}
                            </p>
                        </div>
                    </div>
                   { getStatusBadge(transaction.status)}
                </div>

                {/* Main Alert */}
                <Alert className="border-orange-200 bg-orange-50">
                    <MessageSquareOff className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                        <div className="flex items-start justify-between">
                            <div>
                                <strong>Chat hiện không khả dụng</strong>
                                <p className="mt-1">{message}</p>
                            </div>
                        </div>
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Chat Status Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquareOff className="w-5 h-5 mr-2 text-gray-500" />
                                    Trạng thái cuộc trò chuyện
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center py-8">
                                    <MessageSquareOff className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                        Cuộc trò chuyện chưa khả dụng
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        {message}
                                    </p>
                                    
                                    {transaction.can_be_confirmed && transaction.is_seller && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-center">
                                                <Info className="w-5 h-5 text-blue-600 mr-2" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-blue-800">
                                                        Bạn là người bán
                                                    </p>
                                                    <p className="text-sm text-blue-600">
                                                        Hãy xác nhận đơn hàng để bắt đầu cuộc trò chuyện với người mua.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!transaction.is_seller && (
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                                            <div className="flex items-center">
                                                <Clock className="w-5 h-5 text-gray-600 mr-2" />
                                                <div className="text-left">
                                                    <p className="text-sm font-medium text-gray-800">
                                                        Đang chờ người bán
                                                    </p>
                                                    <p className="text-sm text-gray-600">
                                                        Người bán sẽ xác nhận đơn hàng trong thời gian sớm nhất.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Next Steps Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Bước tiếp theo
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {transaction.is_seller && transaction.can_be_confirmed ? (
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium">Xác nhận đơn hàng</p>
                                                    <p className="text-sm text-gray-600">
                                                        Kiểm tra thông tin đơn hàng và xác nhận để bắt đầu giao dịch
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-500">Chat với người mua</p>
                                                    <p className="text-sm text-gray-500">
                                                        Sau khi xác nhận, bạn có thể trò chuyện với người mua
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium">Chờ người bán xác nhận</p>
                                                    <p className="text-sm text-gray-600">
                                                        Người bán đang xem xét và sẽ xác nhận đơn hàng
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start space-x-3">
                                                <div className="w-2 h-2 bg-gray-300 rounded-full mt-2"></div>
                                                <div>
                                                    <p className="font-medium text-gray-500">Bắt đầu cuộc trò chuyện</p>
                                                    <p className="text-sm text-gray-500">
                                                        Sau khi được xác nhận, bạn có thể trò chuyện với người bán
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Transaction Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin giao dịch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Mã giao dịch</p>
                                    <p className="font-mono text-sm">{transaction.transaction_code}</p>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                                    {getStatusBadge(transaction.status)}
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Vai trò của bạn</p>
                                    <Badge variant={transaction.is_seller ? 'secondary' : 'default'}>
                                        {transaction.is_seller ? 'Người bán' : 'Người mua'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="flex flex-col space-y-2">
                                <Link href={`/customer/store/transactions/${transaction.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="w-4 h-4 mr-2" />
                                        Xem chi tiết giao dịch
                                    </Button>
                                </Link>
                                
                                <Link href="/customer/chat/transaction">
                                    <Button variant="outline" className="w-full justify-start">
                                        <ArrowLeft className="w-4 h-4 mr-2" />
                                        Quay lại danh sách chat
                                    </Button>
                                </Link>

                                {transaction.is_seller && transaction.can_be_confirmed && (
                                    <Link href={`/customer/store/transactions/${transaction.id}`}>
                                        <Button className="w-full justify-start">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            Xác nhận đơn hàng
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Help Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Info className="w-4 h-4 mr-2" />
                                    Cần hỗ trợ?
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-gray-600 mb-3">
                                    Nếu bạn có thắc mắc về trạng thái giao dịch hoặc cần hỗ trợ, hãy liên hệ với chúng tôi.
                                </p>
                                <Button variant="outline" size="sm" className="w-full">
                                    Liên hệ hỗ trợ
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
