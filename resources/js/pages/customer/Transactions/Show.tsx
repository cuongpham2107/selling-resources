import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRightLeft, Clock, CheckCircle, XCircle, AlertTriangle, MessageSquare, Flag, FileText, Download, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import CustomerLayout from '@/layouts/CustomerLayout';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { IntermediateTransaction } from '@/types';

interface TransactionShowPageProps {
    transaction: IntermediateTransaction;
}

const statusConfig = {
    pending: { 
        label: 'Chờ xác nhận', 
        color: 'orange', 
        icon: Clock,
        description: 'Giao dịch đang chờ đối tác xác nhận'
    },
    confirmed: { 
        label: 'Đã xác nhận', 
        color: 'blue', 
        icon: CheckCircle,
        description: 'Giao dịch đã được xác nhận, đang chờ thực hiện'
    },
    seller_sent: { 
        label: 'Người bán đã gửi', 
        color: 'blue', 
        icon: ArrowRightLeft,
        description: 'Người bán đã gửi hàng, chờ người mua xác nhận'
    },
    buyer_received: { 
        label: 'Người mua đã nhận', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Người mua đã xác nhận nhận hàng'
    },
    completed: { 
        label: 'Hoàn thành', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Giao dịch đã hoàn thành thành công'
    },
    cancelled: { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle,
        description: 'Giao dịch đã bị hủy'
    },
    disputed: { 
        label: 'Tranh chấp', 
        color: 'yellow', 
        icon: AlertTriangle,
        description: 'Giao dịch đang trong quá trình giải quyết tranh chấp'
    },
    expired: { 
        label: 'Đã hết hạn', 
        color: 'gray', 
        icon: XCircle,
        description: 'Giao dịch đã hết hạn'
    },
};

export default function TransactionShow({ transaction }: TransactionShowPageProps) {
    const { customer } = useCustomerAuth();
    const [loading, setLoading] = useState(false);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDescription, setDisputeDescription] = useState('');
    
    const isBuyer = transaction.buyer_id === customer?.id;
    const partner = isBuyer ? transaction.seller : transaction.buyer;
    const statusInfo = statusConfig[transaction.status];
    
    const handleAction = async (action: string, data?: Record<string, string>) => {
        setLoading(true);
        try {
            await router.patch(`/customer/transactions/${transaction.id}`, { 
                action,
                ...data 
            });
        } catch (error) {
            console.error('Transaction action failed:', error);
        } finally {
            setLoading(false);
            if (action === 'dispute') {
                setDisputeOpen(false);
                setDisputeReason('');
                setDisputeDescription('');
            }
        }
    };

    const handleDispute = async () => {
        if (!disputeReason.trim() || !disputeDescription.trim()) {
            alert('Vui lòng điền đầy đủ thông tin tranh chấp');
            return;
        }
        
        await handleAction('dispute', {
            reason: disputeReason,
            description: disputeDescription
        });
    };

    const getActionButtons = () => {
        if (transaction.status === 'pending') {
            if (isBuyer) {
                return (
                    <Button 
                        variant="destructive" 
                        onClick={() => handleAction('cancel')}
                        disabled={loading}
                    >
                        Hủy giao dịch
                    </Button>
                );
            } else {
                return (
                    <div className="flex space-x-2">
                        <Button 
                            onClick={() => handleAction('confirm')}
                            disabled={loading}
                        >
                            Xác nhận
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleAction('cancel')}
                            disabled={loading}
                        >
                            Từ chối
                        </Button>
                    </div>
                );
            }
        }
        
        if (transaction.status === 'confirmed') {
            if (!isBuyer) {
                // Seller can mark as shipped
                return (
                    <div className="flex space-x-2">
                        <Button 
                            onClick={() => handleAction('shipped')}
                            disabled={loading}
                        >
                            Đánh dấu đã gửi hàng
                        </Button>
                        <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" disabled={loading}>
                                    <Flag className="w-4 h-4 mr-2" />
                                    Tạo tranh chấp
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Tạo tranh chấp</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="reason">Lý do tranh chấp</Label>
                                        <Textarea
                                            id="reason"
                                            placeholder="Nhập lý do tranh chấp..."
                                            value={disputeReason}
                                            onChange={(e) => setDisputeReason(e.target.value)}
                                            maxLength={500}
                                        />
                                    </div>
                                    <div>
                                        <Label htmlFor="description">Mô tả chi tiết</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Mô tả chi tiết vấn đề..."
                                            value={disputeDescription}
                                            onChange={(e) => setDisputeDescription(e.target.value)}
                                            maxLength={1000}
                                        />
                                    </div>
                                    <div className="flex justify-end space-x-2">
                                        <Button 
                                            variant="outline" 
                                            onClick={() => setDisputeOpen(false)}
                                        >
                                            Hủy
                                        </Button>
                                        <Button 
                                            onClick={handleDispute}
                                            disabled={loading}
                                        >
                                            Tạo tranh chấp
                                        </Button>
                                    </div>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                );
            } else {
                // Buyer can create dispute
                return (
                    <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={loading}>
                                <Flag className="w-4 h-4 mr-2" />
                                Tạo tranh chấp
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo tranh chấp</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="reason">Lý do tranh chấp</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Nhập lý do tranh chấp..."
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        maxLength={500}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Mô tả chi tiết</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Mô tả chi tiết vấn đề..."
                                        value={disputeDescription}
                                        onChange={(e) => setDisputeDescription(e.target.value)}
                                        maxLength={1000}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setDisputeOpen(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button 
                                        onClick={handleDispute}
                                        disabled={loading}
                                    >
                                        Tạo tranh chấp
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
        }
        
        if (transaction.status === 'seller_sent') {
            if (isBuyer) {
                // Buyer can mark as received
                return (
                    <div className="flex space-x-2">
                        <Button 
                            onClick={() => handleAction('received')}
                            disabled={loading}
                        >
                            Xác nhận đã nhận hàng
                        </Button>
                        <Button 
                            variant="outline" 
                            onClick={() => handleAction('dispute')}
                            disabled={loading}
                        >
                            <Flag className="w-4 h-4 mr-2" />
                            Tạo tranh chấp
                        </Button>
                    </div>
                );
            } else {
                // Seller can create dispute
                return (
                    <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" disabled={loading}>
                                <Flag className="w-4 h-4 mr-2" />
                                Tạo tranh chấp
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Tạo tranh chấp</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="reason">Lý do tranh chấp</Label>
                                    <Textarea
                                        id="reason"
                                        placeholder="Nhập lý do tranh chấp..."
                                        value={disputeReason}
                                        onChange={(e) => setDisputeReason(e.target.value)}
                                        maxLength={500}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="description">Mô tả chi tiết</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Mô tả chi tiết vấn đề..."
                                        value={disputeDescription}
                                        onChange={(e) => setDisputeDescription(e.target.value)}
                                        maxLength={1000}
                                    />
                                </div>
                                <div className="flex justify-end space-x-2">
                                    <Button 
                                        variant="outline" 
                                        onClick={() => setDisputeOpen(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button 
                                        onClick={handleDispute}
                                        disabled={loading}
                                    >
                                        Tạo tranh chấp
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                );
            }
        }
        
        return null;
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/transactions">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Giao dịch #{transaction.id}
                            </h1>
                            <p className="text-gray-600">Chi tiết giao dịch và thao tác</p>
                        </div>
                    </div>
                    {getActionButtons()}
                </div>

                {/* Status Alert */}
                <Alert>
                    <statusInfo.icon className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                        <div>
                            <strong>{statusInfo.label}:</strong> {statusInfo.description}
                        </div>
                        <Badge variant="outline" className={`border-${statusInfo.color}-200 text-${statusInfo.color}-700 bg-${statusInfo.color}-50`}>
                            {statusInfo.label}
                        </Badge>
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Transaction Info */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Thông tin giao dịch</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Vai trò của bạn</p>
                                        <Badge variant={isBuyer ? 'default' : 'secondary'}>
                                            {isBuyer ? 'Người mua' : 'Người bán'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Đối tác</p>
                                        <p className="font-semibold">{partner?.username || 'N/A'}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Số tiền giao dịch</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {formatVND(transaction.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Phí giao dịch</p>
                                        <p className="text-lg font-semibold text-orange-600">
                                            {formatVND(transaction.fee || 0)}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600 mb-2">Mô tả</p>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <p className="text-gray-800">{transaction.description || 'Không có mô tả'}</p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div>
                                        <p className="font-medium">Ngày tạo</p>
                                        <p>{formatDate(transaction.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">Cập nhật lần cuối</p>
                                        <p>{formatDate(transaction.updated_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evidence */}
                        {transaction.evidence && transaction.evidence.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <FileText className="w-5 h-5 mr-2" />
                                        Bằng chứng giao dịch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {transaction.evidence.map((evidence, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                <span className="font-medium">Tệp bằng chứng {index + 1}</span>
                                                <Button variant="outline" size="sm">
                                                    <Download className="w-4 h-4 mr-2" />
                                                    Tải xuống
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {
                                    transaction.status === 'pending' && (
                                        <p className='text-sm text-white font-bold bg-green-500 px-4 py-2 rounded-md flex items-center'>
                                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                            Đang chờ xác nhận từ đối tác ...
                                        </p>
                                    )
                                }
                                {transaction.status !== 'pending' && (
                                    <Link href={`/customer/chat/transaction/${transaction.id}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Chat giao dịch
                                        </Button>
                                    </Link>
                                )}

                                {transaction.status === 'completed' && (
                                    <Button variant="outline" className="w-full justify-start">
                                        <Download className="w-4 h-4 mr-2" />
                                        Tải hóa đơn
                                    </Button>
                                )}

                                {transaction.status === 'disputed' && transaction.dispute && (
                                    <Link href={`/customer/disputes/${transaction.dispute.id}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <Flag className="w-4 h-4 mr-2" />
                                            Xem tranh chấp
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>

                        {/* Partner Info */}
                        {partner && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thông tin đối tác</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className='flex flex-row items-center space-x-3'>
                                        <p className="text-sm font-medium text-gray-600">Tên đăng nhập:</p>
                                        <p className="font-semibold">{partner.username}</p>
                                    </div>
                                    {partner.email && (
                                        <div className='flex flex-row items-center space-x-3'>
                                            <p className="text-sm font-medium text-gray-600">Email</p>
                                            <p className="text-sm">{partner.email}</p>
                                        </div>
                                    )}
                                    <div className='flex flex-row items-center space-x-3'>
                                        <p className="text-sm font-medium text-gray-600">Ngày tham gia</p>
                                        <p className="text-sm">{formatDate(partner.created_at)}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Transaction Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Tiến trình giao dịch</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                        <div>
                                            <p className="font-medium text-sm">Tạo giao dịch</p>
                                            <p className="text-xs text-gray-600">{formatDate(transaction.created_at)}</p>
                                        </div>
                                    </div>

                                    {transaction.status !== 'pending' && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div>
                                                <p className="font-medium text-sm">Bắt đầu thực hiện</p>
                                                <p className="text-xs text-gray-600">{formatDate(transaction.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {transaction.status === 'completed' && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div>
                                                <p className="font-medium text-sm">Hoàn thành</p>
                                                <p className="text-xs text-gray-600">{formatDate(transaction.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
