import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { StoreTransaction } from '@/types';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
    MessageSquare, 
    Package,
    User,
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock
} from 'lucide-react';

interface StoreTransactionPageProps {
    transactions: {
        data: StoreTransaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export default function StoreTransactionPage({ transactions }: StoreTransactionPageProps) {
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending':
                return <Clock className="w-4 h-4 text-orange-500" />;
            case 'processing':
                return <Clock className="w-4 h-4 text-blue-500" />;
            case 'completed':
                return <CheckCircle className="w-4 h-4 text-green-500" />;
            case 'disputed':
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            case 'cancelled':
                return <AlertCircle className="w-4 h-4 text-gray-500" />;
            default:
                return <Clock className="w-4 h-4 text-gray-500" />;
        }
    };

    const getStatusLabel = (statusLabel?: string, status?: string) => {
        if (statusLabel) return statusLabel;
        
        const statusLabels = {
            pending: 'Chờ xác nhận',
            processing: 'Đang giao dịch',
            completed: 'Hoàn thành',
            disputed: 'Tranh chấp',
            cancelled: 'Đã hủy',
        };
        return statusLabels[status as keyof typeof statusLabels] || status;
    };

    return (
        <CustomerLayout>
            <Head title="Chat giao dịch gian hàng" />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Chat giao dịch gian hàng
                        </h1>
                        <p className="text-gray-600">
                            Trò chuyện về các giao dịch mua bán sản phẩm
                        </p>
                    </div>
                    <Link href="/customer/chat">
                        <Button variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Tất cả chat
                        </Button>
                    </Link>
                </div>

                {/* Transactions List */}
                <div className="space-y-4">
                    {transactions.data.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có giao dịch gian hàng nào
                                </h3>
                                <p className="text-gray-600 mb-4">
                                    Bạn chưa có giao dịch mua/bán sản phẩm nào để trò chuyện.
                                </p>
                                <Link href="/customer/marketplace">
                                    <Button>
                                        <Package className="w-4 h-4 mr-2" />
                                        Khám phá sản phẩm
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        transactions.data.map((transaction) => (
                            <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-2">
                                                <h3 className="text-lg font-semibold">
                                                    Giao dịch #{transaction.id}
                                                </h3>
                                                <Badge variant="outline" className="flex items-center space-x-1">
                                                    {getStatusIcon(transaction.status)}
                                                    <span>{getStatusLabel(transaction.status_label, transaction.status)}</span>
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                                                <div className="flex items-center space-x-2">
                                                    <Package className="w-4 h-4" />
                                                    <span>{transaction.product?.name || 'Sản phẩm không xác định'}</span>
                                                </div>
                                                
                                                <div className="flex items-center space-x-2">
                                                    <User className="w-4 h-4" />
                                                    <span>
                                                        Với: {transaction.buyer?.username || transaction.seller?.username}
                                                    </span>
                                                </div>

                                                <div className="flex items-center space-x-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{formatDate(transaction.created_at)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <span className="text-sm text-gray-600">Số tiền:</span>
                                                    <span className="font-bold text-green-600">
                                                        {formatVND(transaction.amount)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="ml-6">
                                            <Link href={`/customer/chat/transaction/store/${transaction.id}`}>
                                                <Button>
                                                    <MessageSquare className="w-4 h-4 mr-2" />
                                                    Chat
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex justify-center space-x-2">
                        {Array.from({ length: transactions.last_page }, (_, i) => i + 1).map((page) => (
                            <Link
                                key={page}
                                href={`/customer/chat/transaction?page=${page}`}
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    page === transactions.current_page
                                        ? 'bg-blue-500 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {page}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
