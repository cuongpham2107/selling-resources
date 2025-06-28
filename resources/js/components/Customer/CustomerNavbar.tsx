import React, { useState } from 'react';
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
import { formatVND } from '@/lib/currency';

export function CustomerNavbar() {
    const { customer, isAuthenticated, logout } = useCustomerAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    {/* Logo và Menu mobile */}
                    <div className="flex items-center">
                        <button
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </button>
                        
                        <Link href="/" className="flex items-center ml-4 lg:ml-0">
                            <img 
                                src="/logo.svg" 
                                alt="Giao Dịch MMO" 
                                className="h-8 w-8"
                            />
                            <span className="ml-2 text-xl font-bold text-gray-900">
                                Giao Dịch MMO
                            </span>
                        </Link>
                    </div>

                    {/* Navigation Links - Desktop */}
                    <div className="hidden lg:flex items-center space-x-8">
                        <Link 
                            href="/customer/dashboard" 
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Trang chủ
                        </Link>
                        <Link 
                            href="/customer/transactions" 
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Giao dịch
                        </Link>
                        <Link 
                            href="/customer/store" 
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Cửa hàng
                        </Link>
                        <Link 
                            href="/customer/chat" 
                            className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                        >
                            Chat tổng
                        </Link>
                    </div>

                    {/* User Menu */}
                    <div className="flex items-center space-x-4">
                        {isAuthenticated && customer ? (
                            <>
                                {/* Số dư */}
                                <div className="hidden sm:flex items-center space-x-4 text-sm">
                                    <div className="flex items-center space-x-1">
                                        <Wallet className="h-4 w-4 text-green-600" />
                                        <span className="font-medium text-green-600">
                                            {formatVND(customer.balance?.balance || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                        <span className="text-yellow-600 font-bold">C</span>
                                        <span className="font-medium text-yellow-600">
                                            {customer.points?.points || 0}
                                        </span>
                                    </div>
                                </div>

                                {/* Notifications */}
                                <Button variant="ghost" size="icon" className="relative">
                                    <Bell className="h-5 w-5" />
                                    <Badge 
                                        variant="destructive" 
                                        className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        3
                                    </Badge>
                                </Button>

                                {/* User Menu */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center space-x-2">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                                                <User className="h-4 w-4 text-white" />
                                            </div>
                                            <span className="hidden sm:block font-medium">
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
                            <div className="flex items-center space-x-4">
                                <Link href="/customer/login">
                                    <Button variant="ghost">Đăng nhập</Button>
                                </Link>
                                <Link href="/customer/register">
                                    <Button>Đăng ký</Button>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {mobileMenuOpen && (
                <div className="lg:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
                        <Link 
                            href="/customer/dashboard"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Trang chủ
                        </Link>
                        <Link 
                            href="/customer/transactions"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Giao dịch
                        </Link>
                        <Link 
                            href="/customer/store"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Cửa hàng
                        </Link>
                        <Link 
                            href="/customer/chat"
                            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                        >
                            Chat tổng
                        </Link>
                        
                        {isAuthenticated && customer && (
                            <div className="pt-4 border-t border-gray-200">
                                <div className="flex items-center justify-between px-3 py-2">
                                    <div className="flex items-center space-x-2">
                                        <Wallet className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">
                                            {formatVND(customer.balance?.balance || 0)}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-yellow-600 font-bold">C</span>
                                        <span className="text-sm font-medium text-yellow-600">
                                            {customer.points?.points || 0}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
