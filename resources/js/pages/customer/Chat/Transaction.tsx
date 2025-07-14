import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { MessageSquare, Users, ShoppingBag, Package, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getStatusBadge } from '@/lib/config';

interface UnifiedTransaction {
    id: number;
    type: 'store' | 'intermediate';
    created_at: string;
    updated_at: string;
    status: string;
    status_label?: string;
    amount: number;
    fee?: number;
    buyer_id: number;
    seller_id: number;
    buyer?: { id: number; username: string };
    seller?: { id: number; username: string };
    product?: { id: number; name: string };
    description?: string;
    chat_url: string;
}

interface PaginatedTransactions {
    data: UnifiedTransaction[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    first_page_url: string;
    last_page_url: string;
    next_page_url?: string;
    prev_page_url?: string;
    path: string;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface TransactionChatPageProps {
    transactions: PaginatedTransactions;
}

export default function TransactionChat({ transactions }: TransactionChatPageProps) {
    console.log(transactions);
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatVND = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(amount);
    };

    const getTransactionIcon = (type: string) => {
        return type === 'store' ? <ShoppingBag className="w-5 h-5" /> : <Users className="w-5 h-5" />;
    };

    const getTransactionTypeLabel = (type: string) => {
        return type === 'store' ? 'Giao dịch cửa hàng' : 'Giao dịch trung gian';
    };

    const getChatUrl = (transaction: UnifiedTransaction) => {
        if (transaction.type === 'store') {
            return `/customer/chat/transaction/store/${transaction.id}`;
        } else {
            return `/customer/chat/transaction/intermediate/${transaction.id}`;
        }
    };

    const getTransactionTitle = (transaction: UnifiedTransaction) => {
        if (transaction.type === 'store') {
            return `Giao dịch #${transaction.id}`;
        } else {
            return transaction.description || `Giao dịch trung gian #${transaction.id}`;
        }
    };

    return (
        <CustomerLayout>
            <Head title="Chat Giao dịch" />
            
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                       
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
                            <Card key={`${transaction.type}-${transaction.id}`} className="hover:shadow-md transition-shadow">
                                <CardContent className="px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <Avatar className="w-12 h-12">
                                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                                    {getTransactionIcon(transaction.type)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <h3 className="font-medium text-gray-900 truncate">
                                                        {getTransactionTitle(transaction)}
                                                    </h3>
                                                    <Badge variant="outline" className="text-xs">
                                                        {getTransactionTypeLabel(transaction.type)}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Product info for store transactions */}
                                                {transaction.type === 'store' && transaction.product && (
                                                    <div className="flex items-center space-x-2 mb-2 text-sm text-gray-600">
                                                        <Package className="w-4 h-4" />
                                                        <span>{transaction.product.name}</span>
                                                    </div>
                                                )}
                                                
                                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                    <span className="flex items-center">
                                                        <User className="w-4 h-4 mr-1" />
                                                        Với: {transaction.buyer?.username || transaction.seller?.username}
                                                    </span>
                                                    <span className="flex items-center">
                                                        <Calendar className="w-4 h-4 mr-1" />
                                                        {formatDate(transaction.created_at)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <div className="text-right">
                                                <div className="font-medium text-lg">
                                                    {formatVND(transaction.amount)}
                                                </div>
                                                {getStatusBadge(transaction.status)}
                                            </div>
                                            {
                                                transaction.status === 'App\\States\\IntermediateTransaction\\PendingState' || transaction.status === 'App\\States\\StoreTransaction\\PendingState' ? (
                                                    <></>
                                                ) :(
                                                     <Link href={getChatUrl(transaction)}>
                                                        <Button size="sm">
                                                            <MessageSquare className="w-4 h-4 mr-2" />
                                                            Chat
                                                        </Button>
                                                    </Link>
                                                )
                                            }
                                           
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có giao dịch nào
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    Bạn chưa có giao dịch nào có thể chat. Hãy bắt đầu mua bán để có thể trò chuyện với đối tác.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                    <Link href="/customer/marketplace">
                                        <Button>
                                            <ShoppingBag className="w-4 h-4 mr-2" />
                                            Khám phá sản phẩm
                                        </Button>
                                    </Link>
                                    <Link href="/customer/transactions">
                                        <Button variant="outline">
                                            <Users className="w-4 h-4 mr-2" />
                                            Tạo giao dịch trung gian
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Hiển thị {transactions.from} đến {transactions.to} trong tổng số {transactions.total} giao dịch
                        </div>
                        <div className="flex space-x-2">
                            {transactions.links.map((link, index) => (
                                <React.Fragment key={index}>
                                    {link.url ? (
                                        <Link href={link.url} preserveState>
                                            <Button
                                                variant={link.active ? "default" : "outline"}
                                                size="sm"
                                                className={link.active ? "pointer-events-none" : ""}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        </Link>
                                    ) : (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled
                                            dangerouslySetInnerHTML={{ __html: link.label }}
                                        />
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
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
                                    <li>• Gửi file và hình ảnh</li>
                                </ul>
                            </div>
                            <div className="space-y-3">
                                <h4 className="font-medium text-gray-900">Quy định:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Giữ gìn văn hóa giao tiếp lịch sự</li>
                                    <li>• Không spam tin nhắn</li>
                                    <li>• Không chia sẻ thông tin cá nhân nhạy cảm</li>
                                    <li>• Báo cáo các hành vi vi phạm</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
