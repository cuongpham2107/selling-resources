import React from 'react';
import { Link } from '@inertiajs/react';
import { Bell, User, Wallet, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuSeparator, 
    DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { useSidebar } from '@/contexts/SidebarContext';
import { formatVND } from '@/lib/currency';

export function CustomerNavbar() {
    const { customer, isAuthenticated, logout } = useCustomerAuth();
    const { mobileMenuOpen, toggleMobileMenu } = useSidebar();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="max-w-full mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo và Menu mobile */}
                    <div className="flex items-center">
                        <button
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            onClick={toggleMobileMenu}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                        
                        <Link href="/" className="flex items-center ml-2 lg:ml-0">
                            {/* <img 
                                src="/logo.svg" 
                                alt="Giao Dịch MMO" 
                                className="h-8 w-8 sm:h-10 sm:w-10"
                            /> */}
                            <span className="ml-2 text-lg sm:text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
                                Giao Dịch MMO
                            </span>
                            <span className="ml-2 text-sm font-bold text-gray-900 dark:text-white sm:hidden">
                                GD MMO
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden xl:flex items-center space-x-6">
                        <Link 
                            href="/customer/dashboard" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Trang chủ
                        </Link>
                        <Link 
                            href="/customer/marketplace" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Chợ 
                        </Link>
                        <Link 
                            href="/customer/transactions" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Giao dịch
                        </Link>
                        <Link 
                            href="/customer/purchases" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Mua hàng
                        </Link>
                        <Link 
                            href="/customer/store" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Cửa hàng
                        </Link>
                        <Link 
                            href="/customer/chat/general" 
                            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                        >
                            Chat
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {isAuthenticated && customer ? (
                            <>
                                {/* Số dư - Responsive */}
                                <div className="hidden md:flex items-center space-x-2 lg:space-x-4 text-sm">
                                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-lg">
                                        <Wallet className="h-4 w-4 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-green-600 dark:text-green-400 hidden lg:inline">
                                            {formatVND(customer.balance?.balance || 0)}
                                        </span>
                                        <span className="font-medium text-green-600 dark:text-green-400 lg:hidden">
                                            {formatVND(customer.balance?.balance || 0).replace('₫', '')}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-lg">
                                        <span className="text-yellow-600 dark:text-yellow-400 font-bold">C</span>
                                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                            {customer.points?.points || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Mobile Balance - Compact */}
                                <div className="md:hidden flex items-center space-x-1 text-xs">
                                    <div className="flex items-center space-x-1 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                                        <Wallet className="h-3 w-3 text-green-600 dark:text-green-400" />
                                        <span className="font-medium text-green-600 dark:text-green-400">
                                            {formatVND(customer.balance?.balance || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-1.5 py-0.5 rounded">
                                        <span className="text-yellow-600 dark:text-yellow-400 font-bold text-xs">C</span>
                                        <span className="font-medium text-yellow-600 dark:text-yellow-400">
                                            {formatVND(customer.points?.points || 0)}
                                        </span>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <Button variant="ghost" size="icon" className="relative h-8 w-8 sm:h-10 sm:w-10">
                                    <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        3
                                    </Badge>
                                </Button>

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2 h-8 sm:h-10 px-2 sm:px-3">
                                            <div className="h-6 w-6 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                                <User className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                                            </div>
                                            <span className="hidden lg:block font-medium text-sm truncate max-w-24">
                                                {customer.username}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56">
                                        <DropdownMenuItem asChild>
                                            <Link href="/customer/profile" className="flex items-center">
                                                <User className="h-4 w-4 mr-2" />
                                                Thông tin cá nhân
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/customer/wallet" className="flex items-center">
                                                <Wallet className="h-4 w-4 mr-2" />
                                                Ví của tôi
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/customer/settings" className="flex items-center">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Cài đặt
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                            onClick={logout}
                                            className="flex items-center text-red-600"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Đăng xuất
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <div className="flex items-center space-x-2 sm:space-x-4">
                                <Link href="/customer/login">
                                    <Button variant="ghost" size="sm" className="text-sm">Đăng nhập</Button>
                                </Link>
                                <Link href="/customer/register">
                                    <Button size="sm" className="text-sm">Đăng ký</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
