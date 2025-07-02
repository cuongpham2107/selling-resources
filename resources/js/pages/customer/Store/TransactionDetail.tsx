import React from 'react';
import { router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import {
    ArrowLeft,
    Package,
    User,
    Clock,
    CheckCircle,
    AlertTriangle,
    MessageSquare,
    Shield,
    Store
} from 'lucide-react';
import type { Customer } from '@/types';

interface StoreTransaction {
    id: number;
    transaction_code: string;
    buyer_id: number;
    seller_id: number;
    product_id: number;
    amount: number;
    fee: number;
    status: string;
    completed_at?: string;
    auto_complete_at?: string;
    buyer_early_complete: boolean;
    created_at: string;
    buyer: {
        id: number;
        username: string;
        wallet_balance?: number;
    };
    seller: {
        id: number;
        username: string;
    };
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        images: string[];
        store: {
            id: number;
            store_name: string;
        };
    };
    chats: Array<{
        id: number;
        message: string;
        created_at: string;
        sender: {
            id: number;
            username: string;
        };
    }>;
    disputes: Array<{
        id: number;
        reason: string;
        status: string;
        created_at: string;
    }>;
}

interface Props {
    transaction: StoreTransaction;
    currentUser: Customer;
    isBuyer: boolean;
    isSeller: boolean;
}

export default function TransactionDetail({ transaction, currentUser, isBuyer, isSeller }: Props) {
    const [isCompleting, setIsCompleting] = React.useState(false);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'processing':
                return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>;
            case 'completed':
                return <Badge variant="default" className="bg-green-100 text-green-800">Hoàn thành</Badge>;
            case 'disputed':
                return <Badge variant="destructive">Đang khiếu nại</Badge>;
            case 'cancelled':
                return <Badge variant="destructive" className="bg-gray-100 text-gray-800">Đã hủy</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const handleCompleteTransaction = async () => {
        if (!isBuyer || transaction.status !== 'processing') return;

        setIsCompleting(true);
        try {
            await router.post(`/customer/store/transactions/${transaction.id}/complete`);
        } catch (error) {
            console.error('Complete transaction failed:', error);
        } finally {
            setIsCompleting(false);
        }
    };

    const handleCreateDispute = () => {
        router.get(`/customer/disputes/create?transaction_id=${transaction.id}&type=store`);
    };

    const timeUntilAutoComplete = transaction.auto_complete_at 
        ? new Date(transaction.auto_complete_at).getTime() - new Date().getTime()
        : 0;

    return (
        <CustomerLayout title={`Giao dịch ${transaction.transaction_code}`}>
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            onClick={() => router.get('/customer/store/transactions')}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Danh sách giao dịch
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Giao dịch #{transaction.transaction_code}
                            </h1>
                            <p className="text-gray-600">
                                {isBuyer ? 'Bạn đã mua sản phẩm này' : 'Bạn đã bán sản phẩm này'}
                            </p>
                        </div>
                    </div>
                    {getStatusBadge(transaction.status)}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Transaction Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Package className="h-5 w-5" />
                                    Thông tin sản phẩm
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex gap-4">
                                    {transaction.product.images && transaction.product.images.length > 0 ? (
                                        <img
                                            src={`/storage/${transaction.product.images[0]}`}
                                            alt={transaction.product.name}
                                            className="w-24 h-24 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package className="h-8 w-8 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-lg">{transaction.product.name}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Store className="h-4 w-4" />
                                            <span>{transaction.product.store.store_name}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatVND(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-700">{transaction.product.description}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    Trạng thái giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {/* Created */}
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600" />
                                        <div>
                                            <p className="font-medium">Giao dịch được tạo</p>
                                            <p className="text-sm text-gray-600">{formatDate(transaction.created_at)}</p>
                                        </div>
                                    </div>

                                    {/* Processing */}
                                    <div className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-full border-2 ${
                                            transaction.status === 'processing' ? 'border-yellow-600 bg-yellow-100' :
                                            ['completed', 'disputed'].includes(transaction.status) ? 'border-green-600 bg-green-600' :
                                            'border-gray-300'
                                        }`}>
                                            {['completed', 'disputed'].includes(transaction.status) && (
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">Đang xử lý</p>
                                            {transaction.status === 'processing' && (
                                                <p className="text-sm text-gray-600">
                                                    Chờ xác nhận từ người mua
                                                    {transaction.auto_complete_at && timeUntilAutoComplete > 0 && (
                                                        <span className="block">
                                                            Tự động hoàn thành: {formatDate(transaction.auto_complete_at)}
                                                        </span>
                                                    )}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Completed/Disputed */}
                                    {transaction.status === 'completed' && (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                            <div>
                                                <p className="font-medium">Giao dịch hoàn thành</p>
                                                {transaction.completed_at && (
                                                    <p className="text-sm text-gray-600">{formatDate(transaction.completed_at)}</p>
                                                )}
                                                {transaction.buyer_early_complete && (
                                                    <p className="text-sm text-blue-600">Người mua xác nhận sớm</p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {transaction.status === 'disputed' && (
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-red-600" />
                                            <div>
                                                <p className="font-medium">Đang khiếu nại</p>
                                                <p className="text-sm text-gray-600">Giao dịch đang được xem xét</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chat Section */}
                        {transaction.chats.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5" />
                                        Tin nhắn giao dịch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {transaction.chats.map((chat) => (
                                            <div
                                                key={chat.id}
                                                className={`flex ${chat.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                            >
                                                <div className={`max-w-xs px-3 py-2 rounded-lg ${
                                                    chat.sender.id === currentUser.id
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-100 text-gray-900'
                                                }`}>
                                                    <p className="text-sm">{chat.message}</p>
                                                    <p className={`text-xs mt-1 ${
                                                        chat.sender.id === currentUser.id ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                        {formatDate(chat.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-4">
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => router.get(`/customer/chat/transaction/store/${transaction.id}`)}
                                        >
                                            <MessageSquare className="h-4 w-4 mr-2" />
                                            Mở phòng chat
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Actions Sidebar */}
                    <div className="space-y-6">
                        {/* Participants */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="h-5 w-5" />
                                    Người tham gia
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Người mua:</span>
                                    <span className={`font-medium ${isBuyer ? 'text-blue-600' : ''}`}>
                                        {transaction.buyer.username}
                                        {isBuyer && ' (Bạn)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Người bán:</span>
                                    <span className={`font-medium ${isSeller ? 'text-blue-600' : ''}`}>
                                        {transaction.seller.username}
                                        {isSeller && ' (Bạn)'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Transaction Summary */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chi tiết thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Giá sản phẩm:</span>
                                    <span className="font-medium">{formatVND(transaction.amount)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Phí giao dịch:</span>
                                    <span className="font-medium">{formatVND(transaction.fee)}</span>
                                </div>
                                <hr />
                                <div className="flex justify-between font-semibold">
                                    <span>Tổng cộng:</span>
                                    <span>{formatVND(transaction.amount + transaction.fee)}</span>
                                </div>
                                {isSeller && (
                                    <div className="pt-2 border-t">
                                        <div className="flex justify-between text-green-600 font-medium">
                                            <span>Bạn nhận được:</span>
                                            <span>{formatVND(transaction.amount - transaction.fee)}</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hành động</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* Complete transaction (buyer only, processing status) */}
                                {isBuyer && transaction.status === 'processing' && (
                                    <Button 
                                        className="w-full"
                                        onClick={handleCompleteTransaction}
                                        disabled={isCompleting}
                                    >
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        {isCompleting ? 'Đang xử lý...' : 'Xác nhận đã nhận hàng'}
                                    </Button>
                                )}

                                {/* Create dispute */}
                                {transaction.status === 'processing' && (
                                    <Button 
                                        variant="destructive" 
                                        className="w-full"
                                        onClick={handleCreateDispute}
                                    >
                                        <Shield className="h-4 w-4 mr-2" />
                                        Tạo khiếu nại
                                    </Button>
                                )}

                                {/* Chat button */}
                                <Button 
                                    variant="outline" 
                                    className="w-full"
                                    onClick={() => router.get(`/customer/chat/transaction/store/${transaction.id}`)}
                                >
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    Chat với {isBuyer ? 'người bán' : 'người mua'}
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
