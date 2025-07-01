import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, History, Search, Filter, Eye, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
}

interface Customer {
    id: number;
    username: string;
}

interface User {
    id: number;
    name: string;
}

interface Dispute {
    id: number;
    transaction_type: string;
    transaction_id: number;
    created_by: number;
    reason: string;
    status: string;
    result?: string;
    resolved_at?: string;
    created_at: string;
    transaction?: Transaction;
    creator?: Customer;
    assignedTo?: User;
}

interface DisputeHistoryPageProps {
    disputes: {
        data: Dispute[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        result?: string;
    };
}

const statusConfig = {
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

export default function DisputeHistory({ disputes, filters = {} }: DisputeHistoryPageProps) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
    const [resultFilter, setResultFilter] = useState(filters.result || 'all');

    const handleFilter = () => {
        const searchParams = new URLSearchParams();
        if (search) searchParams.set('search', search);
        if (statusFilter && statusFilter !== 'all') searchParams.set('status', statusFilter);
        if (resultFilter && resultFilter !== 'all') searchParams.set('result', resultFilter);
        
        window.location.href = `/customer/disputes/history?${searchParams.toString()}`;
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

    const resolvedCount = disputes.data.filter(d => d.status === 'resolved').length;
    const cancelledCount = disputes.data.filter(d => d.status === 'cancelled').length;

    return (
        <CustomerLayout>
            <Head title="Lịch sử tranh chấp" />
            
            <div className="mx-auto max-w-5xl space-y-6">
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
                            <h1 className="text-2xl font-bold text-gray-900">Lịch sử tranh chấp</h1>
                            <p className="text-gray-600">Xem các tranh chấp đã được giải quyết hoặc hủy</p>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-8 h-8 text-green-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đã giải quyết</p>
                                    <p className="text-xl font-bold">{resolvedCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <XCircle className="w-8 h-8 text-red-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đã hủy</p>
                                    <p className="text-xl font-bold">{cancelledCount}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <History className="w-8 h-8 text-blue-500" />
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
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
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
                                        <SelectItem value="all">Tất cả kết quả</SelectItem>
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

                {/* History Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Lịch sử tranh chấp</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {disputes.data.length === 0 ? (
                            <div className="text-center py-8">
                                <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có lịch sử tranh chấp</h3>
                                <p className="text-gray-600 mb-4">Các tranh chấp đã hoàn thành sẽ hiển thị ở đây</p>
                                <Link href="/customer/disputes">
                                    <Button>Quay lại danh sách tranh chấp</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Giao dịch</TableHead>
                                            <TableHead>Sản phẩm</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Kết quả</TableHead>
                                            <TableHead>Ngày giải quyết</TableHead>
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
                                                    #{dispute.transaction?.id || dispute.transaction_id}
                                                </TableCell>
                                                <TableCell className="max-w-xs">
                                                    <p className="truncate" title={dispute.transaction?.product?.name}>
                                                        {dispute.transaction?.product?.name || 'N/A'}
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
                                                    {dispute.resolved_at ? formatDate(dispute.resolved_at) : '-'}
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
                                        <Link href={`/customer/disputes/history?page=${disputes.current_page - 1}`}>
                                            <Button variant="outline" size="sm">
                                                Trước
                                            </Button>
                                        </Link>
                                    )}
                                    <span className="flex items-center px-3 py-1 text-sm">
                                        Trang {disputes.current_page} / {disputes.last_page}
                                    </span>
                                    {disputes.current_page < disputes.last_page && (
                                        <Link href={`/customer/disputes/history?page=${disputes.current_page + 1}`}>
                                            <Button variant="outline" size="sm">
                                                Sau
                                            </Button>
                                        </Link>
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
