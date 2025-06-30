import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Flag, Calendar, User, MessageSquare, CheckCircle, XCircle, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CustomerLayout from '@/layouts/CustomerLayout';

interface Report {
    id: number;
    reason: string;
    description: string;
    status: 'pending' | 'reviewing' | 'resolved' | 'rejected';
    created_at: string;
    handled_at: string | null;
    admin_note: string | null;
    general_chat: {
        id: number;
        message: string;
        created_at: string;
        sender: {
            id: number;
            username: string;
        };
    };
    handler?: {
        id: number;
        name: string;
    };
}

interface ReportsIndexProps {
    reports: {
        data: Report[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    reasons: Record<string, string>;
}

export default function ReportsIndex({ reports, reasons }: ReportsIndexProps) {
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending':
                return <Badge variant="outline" className="text-yellow-600 border-yellow-600"><Clock className="w-3 h-3 mr-1" />Chờ xử lý</Badge>;
            case 'reviewing':
                return <Badge variant="outline" className="text-blue-600 border-blue-600"><Eye className="w-3 h-3 mr-1" />Đang xem xét</Badge>;
            case 'resolved':
                return <Badge variant="outline" className="text-green-600 border-green-600"><CheckCircle className="w-3 h-3 mr-1" />Đã xử lý</Badge>;
            case 'rejected':
                return <Badge variant="outline" className="text-red-600 border-red-600"><XCircle className="w-3 h-3 mr-1" />Bị từ chối</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <CustomerLayout>
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/chat/general">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại Chat
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Flag className="w-6 h-6 mr-2 text-red-600" />
                                Báo cáo của tôi
                            </h1>
                            <p className="text-gray-600">Theo dõi trạng thái các báo cáo bạn đã gửi</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-500">
                            Tổng {reports.total} báo cáo
                        </p>
                    </div>
                </div>

                {/* Reports List */}
                {reports.data.length === 0 ? (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Flag className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có báo cáo nào</h3>
                            <p className="text-gray-600 mb-4">Bạn chưa gửi báo cáo nào cho tin nhắn vi phạm.</p>
                            <Link href="/customer/chat/general">
                                <Button>
                                    Trở về Chat Tổng
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {reports.data.map((report) => (
                            <Card key={report.id}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg flex items-center">
                                                <Flag className="w-5 h-5 mr-2 text-red-600" />
                                                Báo cáo #{report.id}
                                            </CardTitle>
                                            <CardDescription className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                Gửi lúc {formatTime(report.created_at)}
                                            </CardDescription>
                                        </div>
                                        {getStatusBadge(report.status)}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Reported Message */}
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                            <MessageSquare className="w-4 h-4 mr-1" />
                                            Tin nhắn bị báo cáo
                                        </h4>
                                        <div className="bg-gray-50 p-3 rounded-lg border">
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="font-medium text-gray-700 flex items-center">
                                                    <User className="w-4 h-4 mr-1" />
                                                    {report.general_chat.sender.username}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {formatTime(report.general_chat.created_at)}
                                                </span>
                                            </div>
                                            <p className="text-gray-700 break-words text-sm">
                                                {report.general_chat.message}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Report Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h5 className="font-medium text-gray-900 mb-1">Lý do báo cáo</h5>
                                            <p className="text-sm text-gray-600">
                                                {reasons[report.reason] || report.reason}
                                            </p>
                                        </div>
                                        {report.description && (
                                            <div>
                                                <h5 className="font-medium text-gray-900 mb-1">Mô tả chi tiết</h5>
                                                <p className="text-sm text-gray-600 break-words">
                                                    {report.description}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Admin Response */}
                                    {(report.status === 'resolved' || report.status === 'rejected') && (
                                        <div className="border-t pt-4">
                                            <h5 className="font-medium text-gray-900 mb-2">Phản hồi từ quản trị viên</h5>
                                            <div className="bg-blue-50 p-3 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-sm font-medium text-blue-900">
                                                        {report.handler?.name || 'Quản trị viên'}
                                                    </span>
                                                    <span className="text-xs text-blue-600">
                                                        {report.handled_at && formatTime(report.handled_at)}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-blue-800">
                                                    {report.admin_note || (
                                                        report.status === 'resolved' 
                                                            ? 'Báo cáo của bạn đã được xử lý.' 
                                                            : 'Báo cáo này không vi phạm quy tắc cộng đồng.'
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}

                        {/* Pagination */}
                        {reports.last_page > 1 && (
                            <div className="flex justify-center space-x-2">
                                {Array.from({ length: reports.last_page }, (_, i) => i + 1).map((page) => (
                                    <Link
                                        key={page}
                                        href={`/customer/reports?page=${page}`}
                                        className={`px-3 py-2 text-sm rounded-md ${
                                            page === reports.current_page
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {page}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
