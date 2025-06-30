import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Shield, 
    Key, 
    Smartphone, 
    Mail, 
    Eye, 
    EyeOff,
    AlertTriangle,
    CheckCircle,
    Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import CustomerLayout from '@/layouts/CustomerLayout';
import { getRelativeTime } from '@/lib/date';
import type { Customer } from '@/types';

interface SecurityActivity {
    id: number;
    activity: string;
    ip_address: string;
    user_agent: string;
    created_at: string;
    is_suspicious?: boolean;
}

interface ProfileSecurityPageProps {
    customer: Customer;
    security_activities: SecurityActivity[];
    two_factor_enabled: boolean;
}

export default function ProfileSecurity({ customer, security_activities, two_factor_enabled }: ProfileSecurityPageProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/profile/password', {
            onSuccess: () => {
                reset();
            }
        });
    };

    const getActivityIcon = (activity: string) => {
        if (activity.includes('login')) return <Key className="w-4 h-4" />;
        if (activity.includes('password')) return <Shield className="w-4 h-4" />;
        if (activity.includes('email')) return <Mail className="w-4 h-4" />;
        return <Shield className="w-4 h-4" />;
    };

    const getActivityColor = (activity: string, isSuspicious?: boolean) => {
        if (isSuspicious) return 'text-red-600 bg-red-50';
        if (activity.includes('login')) return 'text-green-600 bg-green-50';
        if (activity.includes('password')) return 'text-blue-600 bg-blue-50';
        return 'text-gray-600 bg-gray-50';
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/profile">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Bảo mật tài khoản</h1>
                            <p className="text-gray-600">Quản lý cài đặt bảo mật và quyền riêng tư</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Security Overview */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="w-5 h-5 mr-2 text-green-600" />
                                    Tình trạng bảo mật
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Email xác thực</span>
                                    <Badge variant={customer.email_verified_at ? "default" : "destructive"}>
                                        {customer.email_verified_at ? "Đã xác thực" : "Chưa xác thực"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Xác thực 2 bước</span>
                                    <Badge variant={two_factor_enabled ? "default" : "secondary"}>
                                        {two_factor_enabled ? "Đã bật" : "Chưa bật"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">KYC</span>
                                    <Badge variant={customer.kyc_verified_at ? "default" : "secondary"}>
                                        {customer.kyc_verified_at ? "Đã xác thực" : "Chưa xác thực"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Đổi mật khẩu lần cuối</span>
                                    <span className="text-xs text-gray-500">
                                        {customer.password_changed_at ? 
                                            getRelativeTime(customer.password_changed_at) : 
                                            'Chưa bao giờ'
                                        }
                                    </span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Score */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Điểm bảo mật</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-center">
                                    <div className="text-3xl font-bold text-green-600 mb-2">85/100</div>
                                    <p className="text-sm text-gray-600 mb-4">Mức độ bảo mật tốt</p>
                                    <div className="space-y-2 text-left">
                                        <div className="flex items-center text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Email đã xác thực
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                            Mật khẩu mạnh
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                                            Chưa bật xác thực 2 bước
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Security Settings */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Change Password */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Key className="w-5 h-5 mr-2 text-blue-600" />
                                    Đổi mật khẩu
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handlePasswordUpdate} className="space-y-4">
                                    <div>
                                        <Label htmlFor="current_password">Mật khẩu hiện tại</Label>
                                        <div className="relative">
                                            <Input
                                                id="current_password"
                                                type={showCurrentPassword ? "text" : "password"}
                                                value={data.current_password}
                                                onChange={(e) => setData('current_password', e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            >
                                                {showCurrentPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.current_password && (
                                            <p className="text-sm text-red-600 mt-1">{errors.current_password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="password">Mật khẩu mới</Label>
                                        <div className="relative">
                                            <Input
                                                id="password"
                                                type={showNewPassword ? "text" : "password"}
                                                value={data.password}
                                                onChange={(e) => setData('password', e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                            >
                                                {showNewPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password && (
                                            <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="password_confirmation">Xác nhận mật khẩu mới</Label>
                                        <div className="relative">
                                            <Input
                                                id="password_confirmation"
                                                type={showConfirmPassword ? "text" : "password"}
                                                value={data.password_confirmation}
                                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                                className="pr-10"
                                            />
                                            <button
                                                type="button"
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            >
                                                {showConfirmPassword ? (
                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                )}
                                            </button>
                                        </div>
                                        {errors.password_confirmation && (
                                            <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                        )}
                                    </div>

                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        {/* Two-Factor Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                                    Xác thực hai bước (2FA)
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-start space-x-4">
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-600 mb-4">
                                            Xác thực hai bước giúp bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực từ thiết bị di động khi đăng nhập.
                                        </p>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant={two_factor_enabled ? "default" : "secondary"}>
                                                {two_factor_enabled ? "Đã bật" : "Chưa bật"}
                                            </Badge>
                                            <Button 
                                                variant={two_factor_enabled ? "destructive" : "default"}
                                                size="sm"
                                            >
                                                {two_factor_enabled ? "Tắt 2FA" : "Bật 2FA"}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Security Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-purple-600" />
                                    Hoạt động bảo mật
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {security_activities.length > 0 ? security_activities.slice(0, 5).map((activity) => (
                                        <div key={activity.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <div className={`p-2 rounded-lg ${getActivityColor(activity.activity, activity.is_suspicious)}`}>
                                                {getActivityIcon(activity.activity)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {activity.activity}
                                                    </p>
                                                    {activity.is_suspicious && (
                                                        <Badge variant="destructive" className="text-xs">
                                                            Đáng ngờ
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    IP: {activity.ip_address} • {getRelativeTime(activity.created_at)}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1 truncate">
                                                    {activity.user_agent}
                                                </p>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-8">
                                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500">Chưa có hoạt động bảo mật nào được ghi nhận</p>
                                        </div>
                                    )}
                                </div>
                                
                                {security_activities.length > 5 && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="text-center">
                                            <Button variant="outline" size="sm">
                                                Xem tất cả hoạt động
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>

                        {/* Security Tips */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Mẹo bảo mật</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <Alert>
                                        <AlertTriangle className="w-4 h-4" />
                                        <AlertDescription>
                                            <strong>Không chia sẻ mật khẩu:</strong> Không bao giờ chia sẻ mật khẩu của bạn với người khác, kể cả nhân viên hỗ trợ.
                                        </AlertDescription>
                                    </Alert>
                                    <Alert>
                                        <Shield className="w-4 h-4" />
                                        <AlertDescription>
                                            <strong>Sử dụng mật khẩu mạnh:</strong> Sử dụng mật khẩu có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
                                        </AlertDescription>
                                    </Alert>
                                    <Alert>
                                        <Smartphone className="w-4 h-4" />
                                        <AlertDescription>
                                            <strong>Bật xác thực 2 bước:</strong> Thêm một lớp bảo mật bổ sung cho tài khoản của bạn.
                                        </AlertDescription>
                                    </Alert>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
