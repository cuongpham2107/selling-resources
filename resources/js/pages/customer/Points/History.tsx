import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/date';
import {
    History as HistoryIcon,
    TrendingUp,
    TrendingDown,
    ArrowUpDown,
    Calendar,
    Plus,
    Minus
} from 'lucide-react';

interface PointTransaction {
    id: number;
    customer_id: number;
    amount: number;
    type: 'earned' | 'spent' | 'exchange_in' | 'exchange_out';
    description: string;
    created_at: string;
    updated_at: string;
}

interface Props {
    transactions: {
        data: PointTransaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
}

export default function History({ transactions }: Props) {
    const getTransactionIcon = (type: string, amount: number) => {
        if (amount > 0) {
            return <Plus className="h-4 w-4 text-green-600" />;
        } else {
            return <Minus className="h-4 w-4 text-red-600" />;
        }
    };

    const getTransactionColor = (type: string, amount: number) => {
        switch (type) {
            case 'earned':
                return 'bg-green-100 text-green-800';
            case 'spent':
                return 'bg-red-100 text-red-800';
            case 'exchange_in':
                return 'bg-blue-100 text-blue-800';
            case 'exchange_out':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getTransactionLabel = (type: string) => {
        switch (type) {
            case 'earned':
                return 'Kiếm điểm';
            case 'spent':
                return 'Tiêu điểm';
            case 'exchange_in':
                return 'Đổi vào';
            case 'exchange_out':
                return 'Đổi ra';
            default:
                return 'Khác';
        }
    };

    const totalEarned = (transactions.data || [])
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0);

    const totalSpent = Math.abs(
        (transactions.data || [])
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + t.amount, 0)
    );

    return (
        <CustomerLayout>
            <Head title="Lịch sử điểm" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Lịch sử điểm</h1>
                        <p className="text-gray-600">Xem tất cả giao dịch điểm của bạn</p>
                    </div>
                    <Link href="/customer/points">
                        <Button variant="outline">
                            <ArrowUpDown className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <TrendingUp className="h-4 w-4 text-green-600" />
                                Tổng điểm kiếm được
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">
                                +{totalEarned.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                Tổng điểm đã tiêu
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">
                                -{totalSpent.toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2 text-sm font-medium">
                                <HistoryIcon className="h-4 w-4 text-blue-600" />
                                Tổng giao dịch
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">
                                {(transactions?.total || 0).toLocaleString()}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Transaction History */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5" />
                            Lịch sử giao dịch
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {transactions.data.length > 0 ? (
                            <div className="space-y-4">
                                {transactions.data.map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-gray-100">
                                                {getTransactionIcon(transaction.type, transaction.amount)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge className={getTransactionColor(transaction.type, transaction.amount)}>
                                                        {getTransactionLabel(transaction.type)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-gray-900 font-medium">
                                                    {transaction.description}
                                                </p>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-bold text-lg ${
                                                transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {transaction.amount > 0 ? '+' : ''}{(transaction.amount || 0).toLocaleString()}
                                            </div>
                                            <p className="text-xs text-gray-500">điểm</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <HistoryIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    Chưa có giao dịch nào
                                </h3>
                                <p className="text-gray-600">
                                    Bạn chưa có giao dịch điểm nào. Hãy bắt đầu kiếm điểm!
                                </p>
                            </div>
                        )}

                        {/* Pagination */}
                        {transactions.last_page > 1 && (
                            <div className="flex items-center justify-between mt-6 pt-4 border-t">
                                <div className="text-sm text-gray-600">
                                    Trang {transactions.current_page} / {transactions.last_page}
                                    ({transactions.total} giao dịch)
                                </div>
                                <div className="flex gap-2">
                                    {transactions.prev_page_url && (
                                        <Link href={transactions.prev_page_url}>
                                            <Button variant="outline" size="sm">
                                                Trang trước
                                            </Button>
                                        </Link>
                                    )}
                                    {transactions.next_page_url && (
                                        <Link href={transactions.next_page_url}>
                                            <Button variant="outline" size="sm">
                                                Trang sau
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
