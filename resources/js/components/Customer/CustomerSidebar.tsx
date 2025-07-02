import { useSidebar } from '@/contexts/SidebarContext';
import { formatVND } from '@/lib/currency';
import { cn } from '@/lib/utils';
import { Customer } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, Coins, Home, MessageSquare, Package, Store, TrendingUp, User, Users, Wallet, X } from 'lucide-react';
import React, { useEffect } from 'react';

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
    const { mobileMenuOpen, setMobileMenuOpen } = useSidebar();

    // Close mobile menu when clicking on a link
    const handleLinkClick = () => {
        if (window.innerWidth < 1024) {
            // lg breakpoint
            setMobileMenuOpen(false);
        }
    };

    // Close mobile menu when clicking outside (on mobile)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (mobileMenuOpen && window.innerWidth < 1024) {
                const sidebar = document.getElementById('mobile-sidebar');
                const navbar = document.querySelector('nav');

                if (sidebar && !sidebar.contains(event.target as Node) && navbar && !navbar.contains(event.target as Node)) {
                    setMobileMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [mobileMenuOpen, setMobileMenuOpen]);

    const sidebarItems: SidebarItem[] = [
        {
            title: 'Trang chủ',
            href: '/customer/dashboard',
            icon: Home,
        },
        {
            title: 'Chợ',
            href: '/customer/marketplace',
            icon: Store,
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
            href: '/customer/chat/general/room',
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
    ];

    const isActive = (href: string) => {
        return url.startsWith(href);
    };

    if (!customer) {
        return null;
    }

    return (
        <>
            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div 
                    className="bg-black bg-opacity-50 fixed inset-0 z-30 lg:hidden transition-opacity duration-300" 
                    onClick={() => setMobileMenuOpen(false)} 
                />
            )}

            {/* Sidebar */}
            <aside
                id="mobile-sidebar"
                className={cn(
                    'fixed top-16 left-0 z-40 h-[calc(100vh-4rem)] w-64 sm:w-72 overflow-y-auto border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out',
                    'lg:translate-x-0', // Always visible on desktop
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full', // Hidden/visible on mobile
                )}
            >
                {/* Close button for mobile */}
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 p-4 lg:hidden">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
                    <button 
                        onClick={() => setMobileMenuOpen(false)} 
                        className="rounded-md p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-500 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
                
                <div className="p-3 sm:p-4 space-y-6">
                    {/* Customer Info */}
                    <div className="overflow-hidden rounded-lg border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-800 shadow-sm">
                        {/* User header with gradient */}
                        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 sm:p-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-white/20 p-0.5 backdrop-blur-sm">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-white">
                                        <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-white">{customer.username}</p>
                                    <p className="truncate text-xs text-blue-100 mt-1">{customer.email}</p>
                                    
                                    <div className="mt-2">
                                        {customer.kyc_verified_at ? (
                                            <div className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-800">
                                                <div className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500"></div>
                                                KYC Verified
                                            </div>
                                        ) : (
                                            <div className="inline-flex items-center rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-bold text-yellow-800">
                                                <div className="mr-1 h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                                                Chưa KYC
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Balance & Points */}
                        <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-700 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-2">
                                    <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Số dư</span>
                                </div>
                                <div className="text-sm font-bold text-green-600 dark:text-green-400">
                                    {formatVND(customer.balance?.balance || 0)}
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-3">
                                <div className="flex items-center space-x-2">
                                    <Coins className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Điểm C</span>
                                </div>
                                <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                                    {formatVND(customer.points?.points || 0)}
                                </div>
                            </div>
                        </div>
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
                                    onClick={handleLinkClick}
                                    className={cn(
                                        'group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                                        active
                                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-2 border-blue-600 dark:border-blue-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white',
                                    )}
                                >
                                    <Icon
                                        className={cn(
                                            'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                                            active 
                                                ? 'text-blue-600 dark:text-blue-400' 
                                                : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-400',
                                        )}
                                    />
                                    <span className="flex-1 truncate">{item.title}</span>
                                    {item.badge && (
                                        <span className="ml-2 inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/30 px-2 py-0.5 text-xs font-medium text-red-800 dark:text-red-300">
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Quick Actions */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <h3 className="mb-3 text-xs font-semibold tracking-wide text-gray-500 dark:text-gray-400 uppercase">
                            Thao tác nhanh
                        </h3>
                        <div className="space-y-2">
                            <Link
                                href="/customer/transactions/create"
                                className="block w-full rounded-lg bg-blue-600 hover:bg-blue-700 px-3 py-2.5 text-center text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={handleLinkClick}
                            >
                                Tạo giao dịch
                            </Link>
                            <Link
                                href="/customer/products/create"
                                className="block w-full rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2.5 text-center text-sm font-medium text-blue-600 dark:text-blue-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                onClick={handleLinkClick}
                            >
                                Đăng sản phẩm
                            </Link>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
}
