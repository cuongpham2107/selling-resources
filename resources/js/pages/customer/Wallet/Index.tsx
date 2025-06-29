import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import { Wallet, Plus, Send, Download, History, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import type { CustomerBalance, IntermediateTransaction } from '@/types';
import { formatVND } from '@/lib/currency';

interface TransactionWithFee extends IntermediateTransaction {
    type: 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'fee' | 'refund';
    transactionFee?: {
        id: number;
        amount: number;
    };
}

interface PaginatedTransactions {
    data: TransactionWithFee[];
    total: number;
    last_page: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    balance: CustomerBalance | null;
    recentTransactions: PaginatedTransactions;
}

export default function WalletIndex({ balance, recentTransactions }: Props) {
   

    const getTransactionIcon = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'transfer_in':
                return <ArrowDownLeft className="h-4 w-4 text-green-600" />;
            case 'withdrawal':
            case 'transfer_out':
                return <ArrowUpRight className="h-4 w-4 text-red-600" />;
            default:
                return <Wallet className="h-4 w-4 text-gray-600" />;
        }
    };

    const getTransactionColor = (type: string) => {
        switch (type) {
            case 'deposit':
            case 'transfer_in':
                return 'text-green-600';
            case 'withdrawal':
            case 'transfer_out':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <CustomerLayout>
            <Head title="Ví của tôi" />
            
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Ví của tôi</h1>
                        <p className="text-gray-600">
                            Quản lý số dư và giao dịch của bạn
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href={route('customer.wallet.history')}>
                            <Button variant="outline">
                                <History className="h-4 w-4 mr-2" />
                                Lịch sử
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Balance Card */}
                <Card className="overflow-hidden p-0">
                    <div className="bg-gradient-to-r from-blue-400 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-2 rounded-full">
                                    <Wallet className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-xl">Số dư hiện tại</h3>
                            </div>
                            <Badge variant="outline" className="bg-white/20 hover:bg-white/30 text-white border-none">
                                Ví điện tử
                            </Badge>
                        </div>
                        
                        <div className="mt-6">
                            <div className='flex justify-between items-center'>
                                  <p className="text-white text-md font-bold mb-1">Số dư khả dụng</p>
                                    <h2 className="text-4xl font-bold tracking-tight mb-6">
                                        {balance ? formatVND(balance.balance) : formatVND(0)}
                                    </h2>
                            </div>
                            {balance && balance.locked_balance > 0 && (
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-white text-sm">Số dư bị khóa</span>
                                    <span className="font-semibold underline text-red-400">{formatVND(balance.locked_balance)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.wallet.topup')}>
                            <CardContent className="p-6 text-center">
                                <Plus className="h-12 w-12 text-green-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Nạp tiền</h3>
                                <p className="text-sm text-gray-600">
                                    Thêm tiền vào ví của bạn
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.wallet.transfer')}>
                            <CardContent className="p-6 text-center">
                                <Send className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Chuyển tiền</h3>
                                <p className="text-sm text-gray-600">
                                    Gửi tiền cho người dùng khác
                                </p>
                            </CardContent>
                        </Link>
                    </Card>

                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <Link href={route('customer.wallet.withdraw')}>
                            <CardContent className="p-6 text-center">
                                <Download className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                                <h3 className="font-semibold mb-2">Rút tiền</h3>
                                <p className="text-sm text-gray-600">
                                    Rút tiền về tài khoản ngân hàng
                                </p>
                            </CardContent>
                        </Link>
                    </Card>
                </div>

                {/* Recent Transactions */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <CardTitle>Giao dịch gần đây</CardTitle>
                            <Link href={route('customer.wallet.history')}>
                                <Button variant="ghost" size="sm">
                                    Xem tất cả
                                </Button>
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {recentTransactions.data.length > 0 ? (
                            <div className="space-y-4">
                                {recentTransactions.data.slice(0, 10).map((transaction) => (
                                    <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                                        <div className="flex items-center gap-3">
                                            {getTransactionIcon(transaction.type)}
                                            <div>
                                                <div className="font-medium">{transaction.description}</div>
                                                <div className="text-sm text-gray-500">
                                                    {formatDate(transaction.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className={`font-semibold ${getTransactionColor(transaction.type)}`}>
                                                {transaction.type.includes('out') || transaction.type === 'withdrawal' ? '-' : '+'}
                                                {formatVND(transaction.amount)}
                                            </div>
                                            <Badge 
                                                variant={transaction.status === 'completed' ? 'default' : 'secondary'}
                                                className="text-xs"
                                            >
                                                {transaction.status === 'completed' ? 'Hoàn thành' : 
                                                 transaction.status === 'pending' ? 'Chờ xác nhận' :
                                                 transaction.status === 'confirmed' ? 'Đã xác nhận' :
                                                 transaction.status === 'seller_sent' ? 'Người bán đã gửi' :
                                                 transaction.status === 'buyer_received' ? 'Người mua đã nhận' :
                                                 transaction.status === 'disputed' ? 'Tranh chấp' :
                                                 transaction.status === 'cancelled' ? 'Đã hủy' :
                                                 transaction.status === 'expired' ? 'Đã hết hạn' : transaction.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Chưa có giao dịch nào</h3>
                                <p className="text-gray-600 mb-4">
                                    Lịch sử giao dịch của bạn sẽ xuất hiện ở đây khi bạn bắt đầu sử dụng ví.
                                </p>
                                <Link href={route('customer.wallet.topup')}>
                                    <Button>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Nạp tiền lần đầu
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
