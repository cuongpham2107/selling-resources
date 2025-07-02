import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { Customer, StoreTransaction, TransactionChat } from '@/types';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ArrowLeft, 
    MessageSquare, 
    Send, 
    User, 
    Calendar,
    AlertCircle,
    CheckCircle,
    Clock,
    Package,
    ShoppingCart
} from 'lucide-react';

interface StoreTransactionShowProps {
    transaction: StoreTransaction;
    chatMessages: TransactionChat[];
    otherParticipant: Customer;
    currentUser: Customer;
}

export default function StoreTransactionShow({ 
    transaction, 
    chatMessages, 
    otherParticipant, 
    currentUser 
}: StoreTransactionShowProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.message.trim()) {
            return;
        }

        post(`/customer/chat/store-transaction/${transaction.id}`, {
            onSuccess: () => {
                reset('message');
            },
        });
    };

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

    const getStatusLabel = (status: string) => {
        const statusLabels = {
            processing: 'Đang xử lý',
            completed: 'Hoàn thành',
            disputed: 'Tranh chấp',
            cancelled: 'Đã hủy',
        };
        return statusLabels[status as keyof typeof statusLabels] || status;
    };

    const isBuyer = transaction.buyer_id === currentUser.id;

    return (
        <CustomerLayout>
            <Head title={`Chat giao dịch gian hàng #${transaction.id}`} />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/chat/transaction">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chat giao dịch gian hàng #{transaction.id}
                            </h1>
                            <p className="text-gray-600">
                                Trò chuyện với {otherParticipant.username} - {isBuyer ? 'Người bán' : 'Người mua'}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="flex items-center space-x-1">
                        {getStatusIcon(transaction.status)}
                        <span>{getStatusLabel(transaction.status)}</span>
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat Messages */}
                    <div className="lg:col-span-3">
                        <Card className="h-[600px] flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Tin nhắn giao dịch gian hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                {/* Messages Area */}
                                <div className="flex-1 mb-4 pr-4 overflow-y-auto max-h-96"
                                     style={{ scrollbarWidth: 'thin' }}>
                                    <div className="space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>Chưa có tin nhắn nào</p>
                                                <p className="text-sm">Hãy bắt đầu cuộc trò chuyện về giao dịch này!</p>
                                            </div>
                                        ) : (
                                            chatMessages.map((chat, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${
                                                        chat.sender_id === currentUser.id 
                                                            ? 'justify-end' 
                                                            : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            chat.sender_id === currentUser.id
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-xs font-medium">
                                                                {chat.sender_id === currentUser.id 
                                                                    ? 'Bạn' 
                                                                    : chat.sender?.username || 'Người dùng'}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{chat.message}</p>
                                                        <p className={`text-xs mt-1 ${
                                                            chat.sender_id === currentUser.id
                                                                ? 'text-blue-100'
                                                                : 'text-gray-500'
                                                        }`}>
                                                            {formatDate(chat.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Message Input */}
                                {transaction.status === 'processing' && (
                                    <form onSubmit={handleSubmit} className="flex space-x-2">
                                        <Textarea
                                            value={data.message}
                                            onChange={(e) => setData('message', e.target.value)}
                                            placeholder="Nhập tin nhắn về giao dịch này..."
                                            className="flex-1 min-h-[40px] max-h-[120px]"
                                            maxLength={1000}
                                            disabled={processing}
                                        />
                                        <Button 
                                            type="submit" 
                                            disabled={processing || !data.message.trim()}
                                            className="self-end"
                                        >
                                            <Send className="w-4 h-4" />
                                        </Button>
                                    </form>
                                )}

                                {errors.message && (
                                    <p className="text-red-500 text-sm mt-1">{errors.message}</p>
                                )}

                                {transaction.status !== 'processing' && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Giao dịch đã {transaction.status === 'completed' ? 'hoàn thành' : transaction.status === 'disputed' ? 'có tranh chấp' : 'kết thúc'}. 
                                            {transaction.status === 'completed' || transaction.status === 'cancelled' ? ' Không thể gửi tin nhắn mới.' : ''}
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction Info Sidebar */}
                    <div className="space-y-6">
                        {/* Transaction Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-2" />
                                    Thông tin giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Sản phẩm</p>
                                    <p className="font-semibold">{transaction.product?.name || 'N/A'}</p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Vai trò của bạn</p>
                                    <Badge variant={isBuyer ? 'default' : 'secondary'}>
                                        {isBuyer ? 'Người mua' : 'Người bán'}
                                    </Badge>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Số tiền giao dịch</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatVND(transaction.amount)}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Phí giao dịch</p>
                                    <p className="text-sm text-orange-600">
                                        {formatVND(transaction.fee)}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                                    <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                                        {getStatusIcon(transaction.status)}
                                        <span>{getStatusLabel(transaction.status)}</span>
                                    </Badge>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
                                    <p className="text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(transaction.created_at)}
                                    </p>
                                </div>

                                {transaction.completed_at && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Ngày hoàn thành</p>
                                        <p className="text-sm flex items-center">
                                            <Calendar className="w-4 h-4 mr-1" />
                                            {formatDate(transaction.completed_at)}
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Other Participant Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    {isBuyer ? 'Thông tin người bán' : 'Thông tin người mua'}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tên đăng nhập</p>
                                    <p className="font-semibold">{otherParticipant.username}</p>
                                </div>
                                
                                {otherParticipant.email && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Email</p>
                                        <p className="text-sm">{otherParticipant.email}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngày tham gia</p>
                                    <p className="text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDate(otherParticipant.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/customer/transactions/${transaction.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="w-4 h-4 mr-2" />
                                        Xem chi tiết giao dịch
                                    </Button>
                                </Link>

                                {transaction.status === 'disputed' && transaction.dispute && (
                                    <Link href={`/customer/disputes/${transaction.dispute.id}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Xem tranh chấp
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
