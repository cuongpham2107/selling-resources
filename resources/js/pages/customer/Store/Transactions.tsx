import React from 'react';
import { router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import {
    Package,
    Eye,
    ShoppingCart,
    DollarSign,
    Clock
} from 'lucide-react';
import type { Customer } from '@/types';

interface StoreTransactionItem {
    id: number;
    transaction_code: string;
    amount: number;
    fee: number;
    total_amount: number;
    seller_receive_amount: number;
    description: string;
    created_at: string;
    updated_at: string;
    completed_at?: string;
    confirmed_at?: string;
    cancelled_at?: string;
    auto_complete_at?: string;
    
    // Status information
    status: string;           // Class name
    status_label: string;     // "Chờ xác nhận", "Đang giao dịch", etc.
    status_color: string;     // "warning", "primary", "success", etc.
    
    // User roles
    is_buyer: boolean;
    is_seller: boolean;
    
    // Permissions based on current state
    permissions: {
        can_confirm: boolean;   // Chỉ seller && PENDING
        can_cancel: boolean;    // PENDING || PROCESSING
        can_complete: boolean;  // Chỉ buyer && PROCESSING
        can_dispute: boolean;   // PROCESSING
        can_chat: boolean;      // PROCESSING
    };
    
    // Related data
    buyer: {
        id: number;
        username: string;
    };
    seller: {
        id: number;
        username: string;
    };
    product: {
        id: number;
        name: string;
        price: number;
        images: string[];
    };
}

interface Props {
    transactions: {
        data: StoreTransactionItem[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    currentUser: Customer;
    pageTitle?: string;
    pageDescription?: string;
    showOnlyPurchases?: boolean;
}

export default function StoreTransactions({ 
    transactions, 
    currentUser, 
    pageTitle = "Giao dịch cửa hàng",
    pageDescription = "Quản lý các giao dịch mua bán sản phẩm",
    showOnlyPurchases = false
}: Props) {
    const getStatusBadge = (statusLabel: string, statusColor: string) => {
        const colorClass = getStatusColorClass(statusColor);
        return <Badge variant="outline" className={colorClass}>{statusLabel}</Badge>;
    };
    console.log(currentUser);

    const getStatusColorClass = (color: string) => {
        switch (color) {
            case 'warning':
                return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'primary':
                return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'success':
                return 'bg-green-100 text-green-800 border-green-300';
            case 'danger':
                return 'bg-red-100 text-red-800 border-red-300';
            case 'secondary':
                return 'bg-gray-100 text-gray-800 border-gray-300';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getRoleInTransaction = (transaction: StoreTransactionItem) => {
        if (transaction.is_buyer) {
            return { role: 'buyer', partner: transaction.seller.username, icon: ShoppingCart };
        } else {
            return { role: 'seller', partner: transaction.buyer.username, icon: DollarSign };
        }
    };

    return (
        <CustomerLayout title="Giao dịch cửa hàng">
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1>
                        <p className="text-gray-600">{pageDescription}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-sm">
                            {transactions.total} {showOnlyPurchases ? 'giao dịch mua hàng' : 'giao dịch'}
                        </Badge>
                    </div>
                </div>

                {/* Transactions List */}
                {transactions.data.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Package className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">Chưa có giao dịch nào</h3>
                            <p className="mt-2 text-gray-600">Bạn chưa có giao dịch mua bán nào.</p>
                            <div className="mt-6">
                                <Button onClick={() => router.get('/customer/marketplace')}>
                                    <ShoppingCart className="h-4 w-4 mr-2" />
                                    Khám phá sản phẩm
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {transactions.data.map((transaction) => {
                            const { role, partner, icon: RoleIcon } = getRoleInTransaction(transaction);
                            
                            return (
                                <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="px-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                {/* Product Image */}
                                                {transaction.product.images && transaction.product.images.length > 0 ? (
                                                    <img
                                                        src={`/storage/${transaction.product.images[0]}`}
                                                        alt={transaction.product.name}
                                                        className="w-16 h-16 object-cover rounded-lg"
                                                    />
                                                ) : (
                                                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                                                        <Package className="h-6 w-6 text-gray-400" />
                                                    </div>
                                                )}

                                                {/* Transaction Info */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <RoleIcon className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm text-gray-600">
                                                            {role === 'buyer' ? 'Đã mua từ' : 'Đã bán cho'} 
                                                            <span className="font-medium text-gray-900 ml-1">{partner}</span>
                                                        </span>
                                                    </div>
                                                    <h3 className="font-semibold text-lg text-gray-900">{transaction.product.name}</h3>
                                                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                                                        <span>Mã: {transaction.transaction_code}</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            {formatDate(transaction.created_at)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Amount & Status */}
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-green-600 mb-2">
                                                    {formatVND(transaction.amount)}
                                                </div>
                                                {getStatusBadge(transaction.status_label, transaction.status_color)}
                                                <div className="mt-3">
                                                    <Button 
                                                        size="sm" 
                                                        variant="outline"
                                                        onClick={() => router.get(`/customer/store/transactions/${transaction.id}`)}
                                                    >
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Chi tiết
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Fee info for sellers */}
                                        {role === 'seller' && (
                                            <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 px-6 py-3">
                                                <div className="flex justify-between items-center text-sm">
                                                    <span className="text-gray-600">Phí giao dịch:</span>
                                                    <span className="text-red-600">-{formatVND(transaction.fee)}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-medium">
                                                    <span className="text-gray-900">Bạn nhận được:</span>
                                                    <span className="text-green-600">{formatVND(transaction.seller_receive_amount)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}

                {/* Pagination */}
                {transactions.last_page > 1 && (
                    <div className="flex items-center justify-center gap-2">
                        {transactions.links.map((link, index) => (
                            <Button
                                key={index}
                                variant={link.active ? "default" : "outline"}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url)}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
