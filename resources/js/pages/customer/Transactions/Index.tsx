import React, { useState } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRightLeft, Plus, Search, Filter, Eye, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CustomerLayout from '@/layouts/CustomerLayout';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import { IntermediateTransaction } from '@/types';
import { getStatusBadge } from '@/lib/config';

interface TransactionsIndexPageProps {
    transactions: {
        data: IntermediateTransaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters?: {
        search?: string;
        status?: string;
        role?: string;
    };
}



export default function TransactionsIndex({ transactions, filters = {} }: TransactionsIndexPageProps) {
    const { customer } = useCustomerAuth();
    const [search, setSearch] = useState(filters?.search || '');
    const [statusFilter, setStatusFilter] = useState(filters?.status || '');
    const [roleFilter, setRoleFilter] = useState(filters?.role || '');

    const handleFilter = () => {
        const searchParams = new URLSearchParams();
        if (search) searchParams.set('search', search);
        if (statusFilter) searchParams.set('status', statusFilter);
        if (roleFilter) searchParams.set('role', roleFilter);
        
        window.location.href = `/customer/transactions?${searchParams.toString()}`;
    };

    return (
        <CustomerLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Giao dịch</h1>
                        <p className="text-gray-600">Quản lý các giao dịch của bạn</p>
                    </div>
                    <Link href="/customer/transactions/create">
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Tạo giao dịch mới
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
                                    <p className="text-sm font-medium text-gray-600">Chờ xác nhận</p>
                                    <p className="text-xl font-bold">
                                        {transactions.data.filter(t => t.status === 'pending').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <ArrowRightLeft className="w-8 h-8 text-blue-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Đang thực hiện</p>
                                    <p className="text-xl font-bold">
                                        {transactions.data.filter(t => t.status === 'confirmed').length}
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
                                    <p className="text-sm font-medium text-gray-600">Hoàn thành</p>
                                    <p className="text-xl font-bold">
                                        {transactions.data.filter(t => t.status === 'completed').length}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center space-x-2">
                                <AlertTriangle className="w-8 h-8 text-yellow-500" />
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tranh chấp</p>
                                    <p className="text-xl font-bold">
                                        {transactions.data.filter(t => t.status === 'disputed').length}
                                    </p>
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
                                    placeholder="Tìm kiếm giao dịch..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                                        <SelectItem value="CONFIRMED">Đang thực hiện</SelectItem>
                                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                                        <SelectItem value="DISPUTED">Tranh chấp</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? "" : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả vai trò</SelectItem>
                                        <SelectItem value="BUYER">Người mua</SelectItem>
                                        <SelectItem value="SELLER">Người bán</SelectItem>
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

                {/* Transactions Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách giao dịch</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length === 0 ? (
                            <div className="text-center py-8">
                                <ArrowRightLeft className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có giao dịch nào</h3>
                                <p className="text-gray-600 mb-4">Bắt đầu tạo giao dịch đầu tiên của bạn</p>
                                <Link href="/customer/transactions/create">
                                    <Button>Tạo giao dịch mới</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>ID</TableHead>
                                            <TableHead>Đối tác</TableHead>
                                            <TableHead>Vai trò</TableHead>
                                            <TableHead>Số tiền</TableHead>
                                            <TableHead>Trạng thái</TableHead>
                                            <TableHead>Ngày tạo</TableHead>
                                            <TableHead className="text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {transactions.data.map((transaction) => (
                                            <TableRow key={transaction.id}>
                                                <TableCell className="font-medium">
                                                    #{transaction.id}
                                                </TableCell>
                                                <TableCell>
                                                    {transaction.buyer_id === customer?.id 
                                                        ? transaction.seller?.username || 'N/A'
                                                        : transaction.buyer?.username || 'N/A'
                                                    }
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={transaction.buyer_id === customer?.id ? 'default' : 'secondary'}>
                                                        {transaction.buyer_id === customer?.id ? 'Người mua' : 'Người bán'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="font-semibold">
                                                    {formatVND(transaction.amount)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(transaction.status)}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate(transaction.created_at)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link href={`/customer/transactions/${transaction.id}`}>
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
                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-gray-600">
                                    Hiển thị {transactions.data.length} trên {transactions.total} giao dịch
                                </p>
                                <div className="flex space-x-2">
                                    {transactions.current_page > 1 && (
                                        <Link
                                            href={`/customer/transactions?page=${transactions.current_page - 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                                            preserveState
                                        >
                                            <Button variant="outline" size="sm">
                                                Trước
                                            </Button>
                                        </Link>
                                    )}
                                    {transactions.current_page < transactions.last_page && (
                                        <Link
                                            href={`/customer/transactions?page=${transactions.current_page + 1}${search ? `&search=${encodeURIComponent(search)}` : ''}${statusFilter ? `&status=${statusFilter}` : ''}${roleFilter ? `&role=${roleFilter}` : ''}`}
                                            preserveState
                                        >
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
