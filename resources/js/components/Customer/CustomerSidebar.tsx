import React from 'react';
import { Link, usePage } from '@inertiajs/react';
import { 
    Home, 
    ArrowRightLeft, 
    Store, 
    MessageSquare, 
    Wallet, 
    User, 
    Settings,
    AlertTriangle,
    TrendingUp,
    Users,
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Customer } from '@/types';

interface CustomerSidebarProps {
    customer: Customer | null;
}

interface SidebarItem {
    title: string;
    href: string;
    icon: React.ElementType;
    badge?: number;
}

export function CustomerSidebar({ customer }: CustomerSidebarProps) {
    const { url } = usePage();

    const sidebarItems: SidebarItem[] = [
        {
            title: 'Trang chủ',
            href: '/customer/dashboard',
            icon: Home,
        },
        {
            title: 'Giao dịch trung gian',
            href: '/customer/transactions',
            icon: ArrowRightLeft,
        },
        {
            title: 'Cửa hàng cá nhân',
            href: '/customer/store',
            icon: Store,
        },
        {
            title: 'Sản phẩm của tôi',
            href: '/customer/products',
            icon: Package,
        },
        {
            title: 'Chat tổng',
            href: '/customer/chat/general',
            icon: MessageSquare,
        },
        {
            title: 'Chat giao dịch',
            href: '/customer/chat/transaction',
            icon: MessageSquare,
        },
        {
            title: 'Ví của tôi',
            href: '/customer/wallet',
            icon: Wallet,
        },
        {
            title: 'Hệ thống điểm C',
            href: '/customer/points',
            icon: TrendingUp,
        },
        {
            title: 'Giới thiệu bạn bè',
            href: '/customer/referrals',
            icon: Users,
        },
        {
            title: 'Tranh chấp',
            href: '/customer/disputes',
            icon: AlertTriangle,
        },
        {
            title: 'Thông tin cá nhân',
            href: '/customer/profile',
            icon: User,
        },
        {
            title: 'Cài đặt',
            href: '/customer/settings',
            icon: Settings,
        },
    ];

    const isActive = (href: string) => {
        return url.startsWith(href);
    };

    if (!customer) {
        return null;
    }

    return (
        <aside className="fixed left-0 top-16 z-40 w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-white border-r border-gray-200">
            <div className="p-4">
                {/* Customer Info */}
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                            <User className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                {customer.username}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {customer.email}
                            </p>
                        </div>
                    </div>
                    
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="text-center p-2 bg-white rounded border">
                            <div className="font-semibold text-green-600">
                                {(customer.balance?.balance || 0).toLocaleString('vi-VN')}đ
                            </div>
                            <div className="text-gray-500">Số dư</div>
                        </div>
                        <div className="text-center p-2 bg-white rounded border">
                            <div className="font-semibold text-yellow-600">
                                {customer.points?.points || 0} C
                            </div>
                            <div className="text-gray-500">Điểm</div>
                        </div>
                    </div>
                    
                    {/* KYC Status */}
                    {customer.kyc_verified_at ? (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1"></div>
                            KYC đã xác thực
                        </div>
                    ) : (
                        <div className="mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full mr-1"></div>
                            Chưa KYC
                        </div>
                    )}
                </div>

                {/* Navigation Items */}
                <nav className="space-y-1">
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.href);
                        
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                    active
                                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-600'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'mr-3 h-4 w-4 flex-shrink-0',
                                        active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                                    )}
                                />
                                <span className="flex-1">{item.title}</span>
                                {item.badge && (
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Quick Actions */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Thao tác nhanh
                    </h3>
                    <div className="space-y-2">
                        <Link
                            href="/customer/transactions/create"
                            className="block w-full px-3 py-2 text-sm text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Tạo giao dịch
                        </Link>
                        <Link
                            href="/customer/products/create"
                            className="block w-full px-3 py-2 text-sm text-center text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                        >
                            Đăng sản phẩm
                        </Link>
                    </div>
                </div>
            </div>
        </aside>
    );
}
