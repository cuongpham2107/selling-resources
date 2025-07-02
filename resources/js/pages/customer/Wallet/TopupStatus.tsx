import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import { CheckCircle, Clock, CreditCard, ArrowLeft, Copy } from 'lucide-react';
import type { IntermediateTransaction } from '@/types';

interface Props {
    transaction: IntermediateTransaction;
}

export default function TopupStatus({ transaction }: Props) {
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case 'pending':
                return {
                    label: 'Chờ thanh toán',
                    color: 'orange',
                    icon: Clock,
                    description: 'Vui lòng hoàn tất thanh toán để nạp tiền vào ví'
                };
            case 'completed':
                return {
                    label: 'Thành công',
                    color: 'green',
                    icon: CheckCircle,
                    description: 'Tiền đã được nạp vào ví thành công'
                };
            default:
                return {
                    label: status,
                    color: 'gray',
                    icon: Clock,
                    description: 'Đang xử lý giao dịch'
                };
        }
    };

    const statusInfo = getStatusInfo(transaction.status);
    const StatusIcon = statusInfo.icon;

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        // You might want to show a toast notification here
    };

    return (
        <CustomerLayout>
            <Head title="Trạng Thái Nạp Tiền" />
            
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/wallet">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại ví
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <CreditCard className="w-6 h-6 mr-2" />
                                Trạng thái nạp tiền
                            </h1>
                            <p className="text-gray-600">Theo dõi tiến trình nạp tiền vào ví</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Transaction Status */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <span>Thông tin giao dịch</span>
                                <Badge variant="outline" className={`border-${statusInfo.color}-200 text-${statusInfo.color}-700 bg-${statusInfo.color}-50`}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {statusInfo.label}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Mã giao dịch:</span>
                                <div className="flex items-center space-x-2">
                                    <span className="font-mono text-sm">#{transaction.id}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyToClipboard(transaction.id.toString())}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </Button>
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Số tiền:</span>
                                <span className="font-semibold text-lg text-green-600">
                                    {formatCurrency(transaction.amount)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Phí giao dịch:</span>
                                <span className="font-medium">
                                    {formatCurrency(transaction.fee || 0)}
                                </span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Thời gian tạo:</span>
                                <span>{formatDate(transaction.created_at)}</span>
                            </div>

                            <div className="border-t pt-4">
                                <p className="text-sm text-gray-600">{statusInfo.description}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Payment Instructions */}
                    {transaction.status === 'pending' && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Hướng dẫn thanh toán</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-900 mb-2">
                                        Chuyển khoản ngân hàng
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span>Ngân hàng:</span>
                                            <strong>Vietcombank</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Số tài khoản:</span>
                                            <div className="flex items-center space-x-2">
                                                <strong>1234567890</strong>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard('1234567890')}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Chủ tài khoản:</span>
                                            <strong>SELLING RESOURCES PLATFORM</strong>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Nội dung:</span>
                                            <div className="flex items-center space-x-2">
                                                <strong>NAPVI {transaction.id}</strong>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => copyToClipboard(`NAPVI ${transaction.id}`)}
                                                >
                                                    <Copy className="w-3 h-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-medium text-yellow-900 mb-2">Lưu ý quan trọng</h4>
                                    <ul className="text-sm text-yellow-800 space-y-1">
                                        <li>• Chuyển đúng số tiền: {formatCurrency(transaction.amount)}</li>
                                        <li>• Ghi đúng nội dung: NAPVI {transaction.id}</li>
                                        <li>• Tiền sẽ được nạp vào ví trong 5-10 phút</li>
                                        <li>• Liên hệ support nếu sau 30 phút chưa nhận được tiền</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Success Message */}
                    {transaction.status === 'completed' && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-green-600 flex items-center">
                                    <CheckCircle className="w-5 h-5 mr-2" />
                                    Nạp tiền thành công!
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    Giao dịch đã được xử lý thành công. Số tiền {formatCurrency(transaction.amount)} 
                                    đã được nạp vào ví của bạn.
                                </p>
                                <div className="flex space-x-3">
                                    <Link href="/customer/wallet">
                                        <Button>Xem ví của tôi</Button>
                                    </Link>
                                    <Link href="/customer/wallet/history">
                                        <Button variant="outline">Xem lịch sử</Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </CustomerLayout>
    );
}
