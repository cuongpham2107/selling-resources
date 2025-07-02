import React from 'react';
import { Link } from '@inertiajs/react';
import { User, Edit, Activity, TrendingUp, Shield, Calendar, Mail, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getRelativeTime } from '@/lib/date';
import type { Customer } from '@/types';

interface ProfileShowPageProps {
    customer: Customer;
}

export default function ProfileShow({ customer }: ProfileShowPageProps) {
    return (
        <CustomerLayout>
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
                        <p className="text-gray-600">Xem và quản lý thông tin cá nhân của bạn</p>
                    </div>
                    <Link href="/customer/profile/edit">
                        <Button>
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="lg:col-span-1">
                        <CardContent className="p-6">
                            <div className="text-center">
                                <Avatar className="w-24 h-24 mx-auto mb-4">
                                    <AvatarImage src={customer.avatar ? `/storage/${customer.avatar}` : undefined} />
                                    <AvatarFallback className="text-2xl">
                                        {customer.full_name?.charAt(0).toUpperCase() || customer.username?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <h3 className="text-xl font-semibold mb-1">{customer.full_name || customer.username}</h3>
                                <p className="text-gray-600 mb-2">@{customer.username}</p>
                                <Badge variant="secondary" className="mb-4">
                                    Thành viên từ {getRelativeTime(customer.created_at)}
                                </Badge>
                                {customer.bio && (
                                    <p className="text-sm text-gray-700 text-center">
                                        {customer.bio}
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Information Cards */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Contact Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2 text-blue-600" />
                                    Thông tin liên hệ
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">Email:</span>
                                    <span>{customer.email}</span>
                                </div>
                                {customer.phone && (
                                    <div className="flex items-center space-x-3">
                                        <Phone className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-600">Điện thoại:</span>
                                        <span>{customer.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-3">
                                    <Calendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm font-medium text-gray-600">Tham gia:</span>
                                    <span>{new Date(customer.created_at).toLocaleDateString('vi-VN')}</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Hành động nhanh</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link href="/customer/profile/activity">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <Activity className="w-6 h-6 mb-2" />
                                            <span className="text-xs">Hoạt động</span>
                                        </Button>
                                    </Link>
                                    <Link href="/customer/profile/stats">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <TrendingUp className="w-6 h-6 mb-2" />
                                            <span className="text-xs">Thống kê</span>
                                        </Button>
                                    </Link>
                                    <Link href="/customer/profile/security">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <Shield className="w-6 h-6 mb-2" />
                                            <span className="text-xs">Bảo mật</span>
                                        </Button>
                                    </Link>
                                    {/* <Link href="/customer/profile/preferences">
                                        <Button variant="outline" className="w-full h-20 flex-col">
                                            <Settings className="w-6 h-6 mb-2" />
                                            <span className="text-xs">Tùy chọn</span>
                                        </Button>
                                    </Link> */}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
