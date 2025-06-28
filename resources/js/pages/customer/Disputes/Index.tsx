import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { Flag, Plus, Search, Filter, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CustomerLayout from '@/layouts/CustomerLayout';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import type { Dispute } from '@/types';

interface DisputesIndexPageProps {
    disputes: {
        data: Dispute[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        search?: string;
        status?: string;
        result?: string;
    };
}

const statusConfig = {
    pending: { 
        label: 'Đang chờ', 
        color: 'orange', 
        icon: Clock 
    },
    processing: { 
        label: 'Đang xử lý', 
        color: 'blue', 
        icon: AlertTriangle 
    },
    resolved: { 
        label: 'Đã giải quyết', 
        color: 'green', 
        icon: CheckCircle 
    },
    cancelled: { 
        label: 'Đã hủy', 
        color: 'red', 
        icon: XCircle 
    },
};

const resultConfig = {
    refund_buyer: { label: 'Hoàn tiền cho người mua', color: 'green' },
    pay_seller: { label: 'Thanh toán cho người bán', color: 'blue' },
    partial_refund: { label: 'Hoàn tiền một phần', color: 'purple' },
};

export default function DisputesIndex({ disputes, filters }: DisputesIndexPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [resultFilter, setResultFilter] = useState(filters.result || '');

    const handleFilter = () => {
        const searchParams = new URLSearchParams();
        if (search) searchParams.set('search', search);
        if (statusFilter) searchParams.set('status', statusFilter);
        if (resultFilter) searchParams.set('result', resultFilter);
        
        window.location.href = `/customer/disputes?${searchParams.toString()}`;
    };

    const getStatusBadge = (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) return null;
        
        const Icon = config.icon;
        return (
            <Badge variant="outline" className={`border-${config.color}-200 text-${config.color}-700 bg-${config.color}-50`}>
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
            </Badge>
        );
    };

    const getResultBadge = (result: string) => {
        const config = resultConfig[result as keyof typeof resultConfig];
        if (!config) return null;
        
        return (
            <Badge variant="outline" className={`border-${config.color}-200 text-${config.color}-700 bg-${config.color}-50`}>
                {config.label}
            </Badge>
        );
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tranh chấp</h1>
                        <p className="text-gray-600">Quản lý các tranh chấp giao dịch</p>
                    </div>
                    <Link href="/customer/disputes/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo tranh chấp mới
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Clock className="w-8 h-8 text-orange-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang chờ</p>
                                    <p className="text-xl font-bold">
                                        {disputes.data.filter(d => d.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang xử lý</p>
                                    <p className="text-xl font-bold">
                                        {disputes.data.filter(d => d.status === 'processing').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                                    <p className="text-xl font-bold">
                                        {disputes.data.filter(d => d.status === 'resolved').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <Flag className="w-8 h-8 text-purple-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tổng số</p>
                                    <p className="text-xl font-bold">{disputes.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Filter className="w-5 h-5 mr-2" />
                            Bộ lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <Input
                                    placeholder="Tìm kiếm tranh chấp..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="pending">Đang chờ</SelectItem>
                                        <SelectItem value="processing">Đang xử lý</SelectItem>
                                        <SelectItem value="resolved">Đã giải quyết</SelectItem>
                                        <SelectItem value="cancelled">Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={resultFilter} onValueChange={setResultFilter}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Kết quả" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="">Tất cả kết quả</SelectItem>
                                        <SelectItem value="refund_buyer">Hoàn tiền cho người mua</SelectItem>
                                        <SelectItem value="pay_seller">Thanh toán cho người bán</SelectItem>
                                        <SelectItem value="partial_refund">Hoàn tiền một phần</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Button onClick={handleFilter} className="w-full">
                                    <Search className="w-4 h-4 mr-2" />
                                    Tìm kiếm
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Disputes Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách tranh chấp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {disputes.data.length === 0 ? (
                            <div className="text-center py-8">
                                <Flag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có tranh chấp nào</h3>
                                <p className="text-gray-600 mb-4">Tranh chấp sẽ hiển thị ở đây khi bạn tạo</p>
                                <Link href="/customer/disputes/create">
                                    <Button>Tạo tranh chấp mới</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Giao dịch</TableHead>
                                            <TableHead>Lý do</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Kết quả</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {disputes.data.map((dispute) => (
                                            <TableRow key={dispute.id}>
                                                <TableCell className="font-medium">
                                                    #{dispute.id}
                                                </TableCell>
                                                <TableCell>
                                                    #{dispute.transaction?.id || 'N/A'}
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="truncate" title={dispute.reason}>
                                                        {dispute.reason}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {dispute.transaction?.amount 
                                                        ? formatVND(dispute.transaction.amount)
                                                        : 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(dispute.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {dispute.result ? getResultBadge(dispute.result) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(dispute.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/customer/disputes/${dispute.id}`}>
                                                        <Button variant="outline" size="sm">
                                                            <Eye className="w-4 h-4 mr-1" />
                                                            Xem
                                                        </Button>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}

                        {/* Pagination */}
                        {disputes.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-600">
                                    Hiển thị {disputes.data.length} trên {disputes.total} tranh chấp
                                </p>
                                <div className="flex space-x-2">
                                    {disputes.current_page > 1 && (
                                        <Button variant="outline" size="sm">
                                            Trước
                                        </Button>
                                    )}
                                    {disputes.current_page < disputes.last_page && (
                                        <Button variant="outline" size="sm">
                                            Sau
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
