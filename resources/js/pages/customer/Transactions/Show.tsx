import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Clock, MessageSquare, Flag, Download, LoaderCircle } from 'lucide-react';
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
import { statusConfigTransaction } from '@/lib/config';

interface TransactionShowPageProps {
    transaction: IntermediateTransaction;
}



export default function TransactionShow({ transaction }: TransactionShowPageProps) {
    const { customer } = useCustomerAuth();
    const [loading, setLoading] = useState(false);
    const [disputeOpen, setDisputeOpen] = useState(false);
    const [disputeReason, setDisputeReason] = useState('');
    const [disputeDescription, setDisputeDescription] = useState('');
    
    const isBuyer = transaction.buyer_id === customer?.id;
    const partner = isBuyer ? transaction.seller : transaction.buyer;
    
    // Get status info with fallback
    const statusInfo = statusConfigTransaction[transaction.status as keyof typeof statusConfigTransaction] || {
        label: 'Không xác định',
        color: 'gray',
        icon: Clock,
        description: 'Trạng thái giao dịch không xác định'
    };
    
    // Helper to check status (support both enum strings and state machine classes)
    const isStatus = (statusName: string) => {
        return transaction.status === statusName || 
               transaction.status === `App\\States\\IntermediateTransaction\\${statusName.charAt(0).toUpperCase() + statusName.slice(1)}State`;
    };
    
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
    };    const getActionButtons = () => {
        if (isStatus('pending')) {
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
        
        if (isStatus('confirmed')) {
            if (!isBuyer) {
                // Người bán có thể đánh dấu là đã vận chuyển
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
                // Người mua có thể tạo tranh chấp
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
        
        if (isStatus('seller_sent') || isStatus('sellersent')) {
            if (isBuyer) {
                // Người mua có thể đánh dấu là đã nhận
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
                // Người bán có thể tạo tranh chấp
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
            <div className="mx-auto max-w-6xl space-y-6">
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
                                    (isStatus('pending')) && (
                                        <p className='text-sm text-white font-bold bg-green-500 px-4 py-2 rounded-md flex items-center'>
                                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                                            Đang chờ xác nhận từ đối tác ...
                                        </p>
                                    )
                                }
                                {!isStatus('pending') && (
                                    <Link href={`/customer/chat/transaction/intermediate/${transaction.id}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            Chat giao dịch
                                        </Button>
                                    </Link>
                                )}

                                {isStatus('completed') && (
                                    <Button variant="outline" className="w-full justify-start">
                                        <Download className="w-4 h-4 mr-2" />
                                        Tải hóa đơn
                                    </Button>
                                )}

                                {isStatus('disputed') && transaction.dispute && (
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

                                    {!isStatus('pending') && (
                                        <div className="flex items-center space-x-3">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div>
                                                <p className="font-medium text-sm">Bắt đầu thực hiện</p>
                                                <p className="text-xs text-gray-600">{formatDate(transaction.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}

                                    {isStatus('completed') && (
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
