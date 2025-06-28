import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { formatDate } from '@/lib/date';
import { 
    ArrowLeft, 
    History as HistoryIcon, 
    Search, 
    Filter, 
    ArrowUpRight, 
    ArrowDownLeft, 
    TrendingUp, 
    TrendingDown,
    Wallet
} from 'lucide-react';
import type { IntermediateTransaction, Customer } from '@/types';

interface TransactionWithRelations extends IntermediateTransaction {
    customer?: Customer;
    recipient?: Customer;
    sender?: Customer;
}

interface PaginatedTransactions {
    data: TransactionWithRelations[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
    from: number;
    to: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    transactions: PaginatedTransactions;
}

export default function History({ transactions }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    };

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'withdrawal':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            case 'transfer_in':
                return <TrendingUp className="h-4 w-4 text-green-600" />;
            case 'transfer_out':
                return <TrendingDown className="h-4 w-4 text-red-600" />;
            default:
                return <Wallet className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTransactionTitle = (transaction: TransactionWithRelations) => {
        switch (transaction.type) {
            case 'deposit':
                return 'Nạp tiền';
            case 'withdrawal':
                return 'Rút tiền';
            case 'transfer_in':
                return `Nhận tiền từ ${transaction.sender?.username || 'Người dùng'}`;
            case 'transfer_out':
                return `Chuyển tiền cho ${transaction.recipient?.username || 'Người dùng'}`;
            default:
                return transaction.description;
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending: { label: 'Đang xử lý', variant: 'secondary' as const },
            confirmed: { label: 'Đã xác nhận', variant: 'default' as const },
            completed: { label: 'Hoàn thành', variant: 'default' as const },
            cancelled: { label: 'Đã hủy', variant: 'destructive' as const },
            expired: { label: 'Đã hết hạn', variant: 'destructive' as const },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    const getAmountDisplay = (transaction: TransactionWithRelations) => {
        const isIncoming = transaction.type === 'deposit' || transaction.type === 'transfer_in';
        const amount = transaction.amount;
        
        return (
            <div className={`text-right ${isIncoming ? 'text-green-600' : 'text-red-600'}`}>
                <div className="font-semibold">
                    {isIncoming ? '+' : '-'}{formatCurrency(amount)}
                </div>
                {transaction.fee > 0 && (
                    <div className="text-xs text-gray-500">
                        Phí: {formatCurrency(transaction.fee)}
                    </div>
                )}
            </div>
        );
    };

    const handleSearch = () => {
        router.get(route('customer.wallet.history'), {
            search: searchTerm || undefined,
            type: typeFilter !== 'all' ? typeFilter : undefined,
            status: statusFilter !== 'all' ? statusFilter : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handlePageChange = (url: string) => {
        router.get(url, {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <CustomerLayout>
            <Head title="Lịch sử giao dịch" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.wallet.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Lịch sử giao dịch</h1>
                        <p className="text-gray-600">Xem lại tất cả các giao dịch ví của bạn</p>
                    </div>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Bộ lọc
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-4">
                            {/* Search */}
                            <div className="relative">
                                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm theo mô tả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>

                            {/* Type Filter */}
                            <Select value={typeFilter} onValueChange={setTypeFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Loại giao dịch" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả loại</SelectItem>
                                    <SelectItem value="deposit">Nạp tiền</SelectItem>
                                    <SelectItem value="withdrawal">Rút tiền</SelectItem>
                                    <SelectItem value="transfer_in">Nhận tiền</SelectItem>
                                    <SelectItem value="transfer_out">Chuyển tiền</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="pending">Đang xử lý</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="cancelled">Đã hủy</SelectItem>
                                </SelectContent>
                            </Select>

                            {/* Search Button */}
                            <Button onClick={handleSearch} className="w-full">
                                <Search className="h-4 w-4 mr-2" />
                                Tìm kiếm
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction List */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5" />
                            Danh sách giao dịch
                            <span className="text-sm font-normal text-gray-500">
                                ({transactions.from}-{transactions.to} của {transactions.total} giao dịch)
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="p-2 bg-gray-100 rounded-full">
                                                {getTransactionIcon(transaction.type || '')}
                                            </div>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {getTransactionTitle(transaction)}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {transaction.description}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                                    <span>{formatDate(transaction.created_at)}</span>
                                                    {transaction.transaction_code && (
                                                        <>
                                                            <span>•</span>
                                                            <span>#{transaction.transaction_code}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {getStatusBadge(transaction.status)}
                                            {getAmountDisplay(transaction)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <HistoryIcon className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có giao dịch nào
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    Bạn chưa thực hiện giao dịch nào hoặc không có giao dịch nào phù hợp với bộ lọc.
                                </p>
                                <Link href={route('customer.wallet.index')}>
                                    <Button>
                                        <Wallet className="h-4 w-4 mr-2" />
                                        Về trang ví
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <Card>
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-500">
                                    Hiển thị {transactions.from}-{transactions.to} của {transactions.total} giao dịch
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    {transactions.links.map((link, index) => {
                                        if (!link.url) {
                                            return (
                                                <Button
                                                    key={index}
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled
                                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                                />
                                            );
                                        }

                                        return (
                                            <Button
                                                key={index}
                                                variant={link.active ? "default" : "ghost"}
                                                size="sm"
                                                onClick={() => handlePageChange(link.url!)}
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
