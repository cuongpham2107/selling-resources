import React from 'react';
import { router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import StoreTransactionActions from '@/components/StoreTransactionActions';
import AutoCompleteCountdown from '@/components/AutoCompleteCountdown';
import {
    ArrowLeft,
    Package,
    User,
    Clock,
    CheckCircle,
    AlertTriangle,
    Store
} from 'lucide-react';
import type { Customer, StoreTransaction } from '@/types';
import { getStatusBadge } from '@/lib/config';

interface Props {
    transaction: StoreTransaction;
    currentUser: Customer;
}

export default function TransactionDetail({ transaction, currentUser }: Props) {
    // Get user roles from transaction data
    const isBuyer = transaction.is_buyer ?? (transaction.buyer_id === currentUser.id);
    const isSeller = transaction.is_seller ?? (transaction.seller_id === currentUser.id);

    // Ensure amount and fee are numbers
    const amount = typeof transaction.amount === 'string' ? parseFloat(transaction.amount) : transaction.amount ?? 0;
    const fee = typeof transaction.fee === 'string' ? parseFloat(transaction.fee) : transaction.fee ?? 0;
    


    return (
        <CustomerLayout title={`Giao dịch ${transaction.transaction_code}`}>
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start gap-4">
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
                                    {transaction.product?.images && transaction.product.images.length > 0 ? (
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
                                        <h3 className="font-semibold text-lg">{transaction.product?.name || 'Sản phẩm không xác định'}</h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                                            <Store className="h-4 w-4" />
                                            <span>{transaction.product?.store?.store_name || 'Cửa hàng không xác định'}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-green-600 mt-2">
                                            {formatVND(transaction.amount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <p className="text-gray-700">{transaction.product?.description || ''}</p>
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

                                    {/* Pending Confirmation */}
                                    <div className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-full border-2 ${
                                            transaction.status === 'pending' ? 'border-orange-600 bg-orange-100' :
                                            ['processing', 'completed', 'disputed'].includes(transaction.status) ? 'border-green-600 bg-green-600' :
                                            'border-gray-300'
                                        }`}>
                                            {['processing', 'completed', 'disputed'].includes(transaction.status) && (
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">Chờ xác nhận</p>
                                            {transaction.status === 'pending' && (
                                                <p className="text-sm text-gray-600">
                                                    Chờ người bán xác nhận đơn hàng
                                                </p>
                                            )}
                                            {transaction.confirmed_at && (
                                                <p className="text-sm text-gray-600">
                                                    Đã xác nhận: {formatDate(transaction.confirmed_at)}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Processing */}
                                    <div className="flex items-center gap-3">
                                        <div className={`h-5 w-5 rounded-full border-2 ${
                                            transaction.status === 'processing' ? 'border-blue-600 bg-blue-100' :
                                            ['completed', 'disputed'].includes(transaction.status) ? 'border-green-600 bg-green-600' :
                                            'border-gray-300'
                                        }`}>
                                            {['completed', 'disputed'].includes(transaction.status) && (
                                                <CheckCircle className="h-5 w-5 text-white" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium">Đang giao dịch</p>
                                            {transaction.status === 'processing' && (
                                                <div className="text-sm text-gray-600">
                                                    <p>Chờ xác nhận từ người mua</p>
                                                    {transaction.auto_complete_at && (
                                                        <div className="mt-2">
                                                            <AutoCompleteCountdown 
                                                                autoCompleteAt={transaction.auto_complete_at}
                                                                className="text-xs"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
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
                                                <p className="font-medium">Đang tranh chấp</p>
                                                <p className="text-sm text-gray-600">Giao dịch đang được xem xét</p>
                                            </div>
                                        </div>
                                    )}

                                    {transaction.status === 'cancelled' && (
                                        <div className="flex items-center gap-3">
                                            <AlertTriangle className="h-5 w-5 text-gray-600" />
                                            <div>
                                                <p className="font-medium">Giao dịch đã hủy</p>
                                                <p className="text-sm text-gray-600">Giao dịch đã bị hủy bỏ</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chat Section - commented out as not part of main interface */}
                        {/* TODO: Add chats to StoreTransaction interface if needed */}
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
                                        {transaction.buyer?.username || 'N/A'}
                                        {isBuyer && ' (Bạn)'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Người bán:</span>
                                    <span className={`font-medium ${isSeller ? 'text-blue-600' : ''}`}>
                                        {transaction.seller?.username || 'N/A'}
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
                                   
                                <div className="flex justify-between font-semibold">
                                    <span>Tổng cộng:</span>
                                    <span>{formatVND(amount + fee, { maximumFractionDigits: 0 })}</span>
                                </div>
                                {isSeller && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Bạn nhận được:</span>
                                        <span>{formatVND(transaction.amount * 0.99)}</span>
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
                                <StoreTransactionActions 
                                    transaction={transaction}
                                    isBuyer={isBuyer}
                                    size="default"
                                    variant="full"
                                />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
