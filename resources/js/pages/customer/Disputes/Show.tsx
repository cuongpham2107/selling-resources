import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, MessageSquare, Calendar, User, FileText, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import CustomerLayout from '@/layouts/CustomerLayout';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';

interface Transaction {
    id: number;
    amount: number;
    created_at: string;
    product?: {
        id: number;
        name: string;
    };
    seller?: {
        id: number;
        username: string;
    };
}

interface User {
    id: number;
    name: string;
}

interface Customer {
    id: number;
    username: string;
}

interface Dispute {
    id: number;
    transaction_type: string;
    transaction_id: number;
    created_by: number;
    reason: string;
    evidence?: string[];
    status: string;
    result?: string;
    admin_notes?: string;
    resolved_at?: string;
    created_at: string;
    updated_at: string;
    transaction?: Transaction;
    creator?: Customer;
    assignedTo?: User;
}

interface ShowDisputePageProps {
    dispute: Dispute;
    isCreator: boolean;
}

const statusConfig = {
    pending: { 
        label: 'Đang chờ xử lý', 
        color: 'orange', 
        icon: Clock,
        description: 'Tranh chấp đang chờ được xem xét'
    },
    processing: { 
        label: 'Đang xử lý', 
        color: 'blue', 
        icon: AlertCircle,
        description: 'Tranh chấp đang được xử lý bởi đội ngũ hỗ trợ'
    },
    resolved: { 
        label: 'Đã giải quyết', 
        color: 'green', 
        icon: CheckCircle,
        description: 'Tranh chấp đã được giải quyết'
    },
    cancelled: { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle,
        description: 'Tranh chấp đã bị hủy'
    },
};

const resultConfig = {
    refund_buyer: { label: 'Hoàn tiền cho người mua', color: 'green' },
    pay_seller: { label: 'Thanh toán cho người bán', color: 'blue' },
    partial_refund: { label: 'Hoàn tiền một phần', color: 'purple' },
};

export default function ShowDispute({ dispute, isCreator }: ShowDisputePageProps) {
    const [showResponseForm, setShowResponseForm] = useState(false);
    
    const { data, setData, post, processing, errors } = useForm({
        additional_info: '',
        evidence_files: [] as File[]
    });

    const handleResponse = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/customer/disputes/${dispute.id}/respond`, {
            onSuccess: () => {
                setShowResponseForm(false);
                setData('additional_info', '');
                setData('evidence_files', []);
            }
        });
    };

    const handleCancel = () => {
        if (confirm('Bạn có chắc chắn muốn hủy tranh chấp này?')) {
            post(`/customer/disputes/${dispute.id}/cancel`);
        }
    };

    const handleEscalate = () => {
        if (confirm('Bạn có muốn nâng cấp tranh chấp này lên cấp cao hơn?')) {
            post(`/customer/disputes/${dispute.id}/escalate`);
        }
    };

    const downloadEvidence = (fileIndex: number) => {
        window.open(`/customer/disputes/${dispute.id}/evidence/${fileIndex}`, '_blank');
    };

    const statusInfo = statusConfig[dispute.status as keyof typeof statusConfig];
    const StatusIcon = statusInfo?.icon || AlertCircle;

    const canRespond = isCreator && ['pending', 'processing'].includes(dispute.status);
    const canCancel = isCreator && ['pending', 'processing'].includes(dispute.status);
    const canEscalate = isCreator && dispute.status === 'processing';

    return (
        <CustomerLayout>
            <Head title={`Tranh chấp #${dispute.id}`} />
            
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/disputes">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tranh chấp #{dispute.id}</h1>
                            <p className="text-gray-600">Chi tiết tranh chấp và trạng thái xử lý</p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                        {canEscalate && (
                            <Button variant="outline" onClick={handleEscalate}>
                                Nâng cấp
                            </Button>
                        )}
                        {canCancel && (
                            <Button variant="outline" onClick={handleCancel}>
                                Hủy tranh chấp
                            </Button>
                        )}
                        {canRespond && (
                            <Button onClick={() => setShowResponseForm(!showResponseForm)}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Phản hồi
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Status Card */}
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center space-x-4">
                                    <div className={`p-3 rounded-full bg-${statusInfo?.color}-100`}>
                                        <StatusIcon className={`w-6 h-6 text-${statusInfo?.color}-600`} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold">{statusInfo?.label}</h3>
                                        <p className="text-gray-600">{statusInfo?.description}</p>
                                        {dispute.result && (
                                            <div className="mt-2">
                                                <Badge variant="outline" className={`border-${resultConfig[dispute.result as keyof typeof resultConfig]?.color}-200`}>
                                                    {resultConfig[dispute.result as keyof typeof resultConfig]?.label}
                                                </Badge>
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-right text-sm text-gray-500">
                                        <p>Tạo: {formatDate(dispute.created_at)}</p>
                                        {dispute.resolved_at && (
                                            <p>Giải quyết: {formatDate(dispute.resolved_at)}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Dispute Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Chi tiết tranh chấp</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Lý do tranh chấp:</Label>
                                    <div className="mt-1 p-4 bg-gray-50 rounded-lg">
                                        <p className="whitespace-pre-wrap">{dispute.reason}</p>
                                    </div>
                                </div>

                                {dispute.evidence && dispute.evidence.length > 0 && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Bằng chứng đính kèm:</Label>
                                        <div className="mt-2 space-y-2">
                                            {dispute.evidence.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm">Bằng chứng {index + 1}</span>
                                                    </div>
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => downloadEvidence(index)}
                                                    >
                                                        <Download className="w-4 h-4 mr-1" />
                                                        Tải xuống
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {dispute.admin_notes && (
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Ghi chú từ đội ngũ hỗ trợ:</Label>
                                        <div className="mt-1 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <p className="whitespace-pre-wrap text-blue-900">{dispute.admin_notes}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Response Form */}
                        {showResponseForm && canRespond && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Thêm thông tin</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleResponse} className="space-y-4">
                                        <div>
                                            <Label htmlFor="additional_info">Thông tin bổ sung</Label>
                                            <Textarea
                                                id="additional_info"
                                                value={data.additional_info}
                                                onChange={(e) => setData('additional_info', e.target.value)}
                                                placeholder="Cung cấp thêm thông tin hoặc bằng chứng..."
                                                rows={4}
                                                className={errors.additional_info ? 'border-red-500' : ''}
                                            />
                                            {errors.additional_info && (
                                                <p className="text-sm text-red-600 mt-1">{errors.additional_info}</p>
                                            )}
                                        </div>

                                        <div className="flex justify-end space-x-2">
                                            <Button 
                                                type="button" 
                                                variant="outline"
                                                onClick={() => setShowResponseForm(false)}
                                            >
                                                Hủy
                                            </Button>
                                            <Button type="submit" disabled={processing}>
                                                {processing ? 'Đang gửi...' : 'Gửi phản hồi'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Transaction Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2" />
                                    Thông tin giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm text-gray-600">ID giao dịch:</Label>
                                    <p className="font-medium">#{dispute.transaction?.id || dispute.transaction_id}</p>
                                </div>
                                {dispute.transaction?.product && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Sản phẩm:</Label>
                                        <p className="font-medium">{dispute.transaction.product.name}</p>
                                    </div>
                                )}
                                {dispute.transaction?.seller && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Người bán:</Label>
                                        <p className="font-medium">{dispute.transaction.seller.username}</p>
                                    </div>
                                )}
                                {dispute.transaction?.amount && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Số tiền:</Label>
                                        <p className="font-medium text-lg">{formatVND(dispute.transaction.amount)}</p>
                                    </div>
                                )}
                                {dispute.transaction?.created_at && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Ngày giao dịch:</Label>
                                        <p className="font-medium">{formatDate(dispute.transaction.created_at)}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Participants */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Thông tin liên quan
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <Label className="text-sm text-gray-600">Người tạo tranh chấp:</Label>
                                    <p className="font-medium">{dispute.creator?.username || 'N/A'}</p>
                                </div>
                                {dispute.assignedTo && (
                                    <div>
                                        <Label className="text-sm text-gray-600">Được phân công cho:</Label>
                                        <p className="font-medium">{dispute.assignedTo.name}</p>
                                    </div>
                                )}
                                <Separator />
                                <div>
                                    <Label className="text-sm text-gray-600">Loại giao dịch:</Label>
                                    <p className="font-medium capitalize">{dispute.transaction_type}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Timeline */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Calendar className="w-5 h-5 mr-2" />
                                    Lịch sử
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                    <div>
                                        <p className="font-medium">Tranh chấp được tạo</p>
                                        <p className="text-sm text-gray-500">{formatDate(dispute.created_at)}</p>
                                    </div>
                                </div>
                                {dispute.status === 'processing' && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">Bắt đầu xử lý</p>
                                            <p className="text-sm text-gray-500">{formatDate(dispute.updated_at)}</p>
                                        </div>
                                    </div>
                                )}
                                {dispute.resolved_at && (
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                                        <div>
                                            <p className="font-medium">Đã giải quyết</p>
                                            <p className="text-sm text-gray-500">{formatDate(dispute.resolved_at)}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
