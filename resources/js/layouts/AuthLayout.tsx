import React from 'react';
import { Head } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AuthLayout({ children, title = 'Đăng nhập' }: AuthLayoutProps) {
    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
                {/* Simple header without navigation */}
                <div className="fixed top-0 left-0 right-0 bg-white shadow-sm z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-4">
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <h1 className="text-xl font-bold text-gray-900">
                                        SellingResources
                                    </h1>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-sm text-gray-600">
                                    Nền tảng giao dịch trung gian an toàn
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="pt-20 pb-12">
                    {children}
                </div>

                {/* Simple footer */}
                <div className="bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="text-center text-sm text-gray-500">
                            <p>&copy; 2025 SellingResources. Tất cả quyền được bảo lưu.</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
