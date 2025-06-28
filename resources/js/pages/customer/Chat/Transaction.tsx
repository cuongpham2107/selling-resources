import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, MessageSquare, Users, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getRelativeTime } from '@/lib/date';
import type { StoreTransaction, PaginatedResponse } from '@/types';

interface TransactionChatPageProps {
    transactions: PaginatedResponse<StoreTransaction & {
        product?: { id: number; name: string };
        buyer?: { id: number; username: string };
        seller?: { id: number; username: string };
    }>;
}

export default function TransactionChat({ transactions }: TransactionChatPageProps) {
    const getStatusBadge = (status: string) => {
        const variants = {
            pending: 'secondary',
            processing: 'default',
            completed: 'secondary',
            disputed: 'destructive',
            cancelled: 'secondary',
        } as const;

        const labels = {
            pending: 'Chờ xử lý',
            processing: 'Đang xử lý',
            completed: 'Hoàn thành',
            disputed: 'Tranh chấp',
            cancelled: 'Đã hủy',
        } as const;

        return (
            <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
                {labels[status as keyof typeof labels] || status}
            </Badge>
        );
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/chat">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chat Giao dịch</h1>
                            <p className="text-gray-600">Tin nhắn liên quan đến giao dịch mua bán</p>
                        </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                        {transactions.total} giao dịch
                    </Badge>
                </div>

                {/* Transactions List */}
                <div className="space-y-4">
                    {transactions.data.length > 0 ? (
                        transactions.data.map((transaction) => (
                            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    {transaction.buyer?.username?.charAt(0).toUpperCase() || 
                                                     transaction.seller?.username?.charAt(0).toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-medium text-gray-900">
                                                        Giao dịch #{transaction.id}
                                                    </h3>
                                                    {getStatusBadge(transaction.status)}
                                                </div>
                                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                    <div className="flex items-center space-x-1">
                                                        <ShoppingBag className="w-4 h-4" />
                                                        <span>{transaction.product?.name || 'Sản phẩm không xác định'}</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Users className="w-4 h-4" />
                                                        <span>
                                                            {transaction.buyer?.username} ↔ {transaction.seller?.username}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-1">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{getRelativeTime(transaction.created_at)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <div className="text-right">
                                                <p className="font-medium text-gray-900">
                                                    {transaction.amount?.toLocaleString()} VNĐ
                                                </p>
                                                <p className="text-sm text-gray-500">
                                                    Giá trị giao dịch
                                                </p>
                                            </div>
                                            <Button asChild>
                                                <Link href={`/customer/chat/transaction/${transaction.id}`}>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="text-center py-12">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có giao dịch nào
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    Bạn chưa có giao dịch nào để chat. Hãy mua hoặc bán sản phẩm để bắt đầu giao dịch.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <Button asChild>
                                        <Link href="/customer/products">
                                            Xem sản phẩm
                                        </Link>
                                    </Button>
                                    <Button asChild variant="outline">
                                        <Link href="/customer/store">
                                            Quản lý cửa hàng
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex justify-center space-x-2">
                        {transactions.current_page > 1 && (
                            <Button 
                                variant="outline" 
                                onClick={() => window.location.href = `?page=${transactions.current_page - 1}`}
                            >
                                Trang trước
                            </Button>
                        )}
                        
                        <div className="flex items-center px-4">
                            <span className="text-sm text-gray-600">
                                Trang {transactions.current_page} / {transactions.last_page}
                            </span>
                        </div>

                        {transactions.current_page < transactions.last_page && (
                            <Button 
                                variant="outline"
                                onClick={() => window.location.href = `?page=${transactions.current_page + 1}`}
                            >
                                Trang sau
                            </Button>
                        )}
                    </div>
                )}

                {/* Info Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                            Về chat giao dịch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Tính năng:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Chat riêng tư giữa người mua và người bán</li>
                                    <li>• Thảo luận chi tiết về sản phẩm và giao dịch</li>
                                    <li>• Lịch sử tin nhắn được lưu trữ</li>
                                    <li>• Hỗ trợ giải quyết tranh chấp</li>
                                </ul>
                            </div>
                            
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Lưu ý:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Chỉ chat được khi có giao dịch đang diễn ra</li>
                                    <li>• Tuân thủ quy tắc chat chung của nền tảng</li>
                                    <li>• Không chia sẻ thông tin cá nhân nhạy cảm</li>
                                    <li>• Báo cáo hành vi bất thường ngay lập tức</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
