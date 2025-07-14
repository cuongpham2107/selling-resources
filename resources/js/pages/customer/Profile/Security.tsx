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
    Clock,
    Copy,
    RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
    customer?: Customer;
    security_activities: SecurityActivity[];
    two_factor_enabled: boolean;
}

export default function ProfileSecurity({ customer, security_activities, two_factor_enabled }: ProfileSecurityPageProps) {
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [showDisablePassword, setShowDisablePassword] = useState(false);
    const [twoFactorSetup, setTwoFactorSetup] = useState<{
        qrCode?: string;
        setupKey?: string;
        recoveryCodes?: string[];
    } | null>(null);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
    const [isLoadingRecoveryCodes, setIsLoadingRecoveryCodes] = useState(false);
    const [recoveryCodesError, setRecoveryCodesError] = useState<string>('');

    const { data, setData, patch, processing, errors, reset } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const confirmationForm = useForm({
        code: '',
    });

    const disableForm = useForm({
        password: '',
    });

    const handlePasswordUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        patch('/customer/profile/password', {
            onSuccess: () => {
                reset();
            }
        });
    };

    const handleEnable2FA = () => {
        setIsSettingUp2FA(true);
        
        // Use fetch instead of Inertia router for JSON response
        fetch('/customer/profile/two-factor-authentication', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message && data.qr_code) {
                setTwoFactorSetup({
                    qrCode: `data:image/svg+xml;base64,${btoa(data.qr_code)}`,
                    setupKey: data.setup_key,
                    recoveryCodes: Array.isArray(data.recovery_codes) ? data.recovery_codes : [],
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setIsSettingUp2FA(false);
        });
    };

    const handleConfirm2FA = (e: React.FormEvent) => {
        e.preventDefault();
        
        confirmationForm.post('/customer/profile/confirmed-two-factor-authentication', {
            onSuccess: () => {
                setTwoFactorSetup(null);
                setIsSettingUp2FA(false);
                confirmationForm.reset();
                // No need to reload, the redirect will handle the page update
            }
        });
    };

    const handleDisable2FA = (e: React.FormEvent) => {
        e.preventDefault();
        
        disableForm.delete('/customer/profile/two-factor-authentication', {
            onSuccess: () => {
                disableForm.reset();
                // No need to reload, the redirect will handle the page update
            }
        });
    };



    const handleShowRecoveryCodes = () => {
        setIsLoadingRecoveryCodes(true);
        setShowRecoveryCodes(true);
        setRecoveryCodesError('');
        
        fetch('/customer/profile/two-factor-recovery-codes', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
        })
        .then(response => {
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(({ status, data }) => {
            
            if (status === 200 && data.recovery_codes) {
                // Handle both array and string formats
                let codes: string[] = [];
                if (Array.isArray(data.recovery_codes)) {
                    codes = data.recovery_codes;
                } else if (typeof data.recovery_codes === 'string') {
                    // If it's a single string, split it or treat it as one code
                    codes = data.recovery_codes.includes(',') 
                        ? data.recovery_codes.split(',').map((code: string) => code.trim())
                        : [data.recovery_codes];
                }
                
                setRecoveryCodes(codes);
                setRecoveryCodesError('');
            } else {
                console.warn('Error or no recovery codes:', data);
                setRecoveryCodes([]);
                setRecoveryCodesError(data.error || 'Không thể tải mã khôi phục. Vui lòng thử lại.');
            }
        })
        .catch(error => {
            console.error('Error fetching recovery codes:', error);
            setRecoveryCodes([]);
            setRecoveryCodesError('Đã xảy ra lỗi khi tải mã khôi phục. Vui lòng thử lại.');
        })
        .finally(() => {
            setIsLoadingRecoveryCodes(false);
        });
    };

    const handleRegenerateRecoveryCodes = () => {
        setIsLoadingRecoveryCodes(true);
        setRecoveryCodesError('');
        
        fetch('/customer/profile/two-factor-recovery-codes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || ''
            },
        })
        .then(response => {
            return response.json().then(data => ({
                status: response.status,
                data: data
            }));
        })
        .then(({ status, data }) => {
            
            if (status === 200 && data.recovery_codes) {
                // Handle both array and string formats
                let codes: string[] = [];
                if (Array.isArray(data.recovery_codes)) {
                    codes = data.recovery_codes;
                } else if (typeof data.recovery_codes === 'string') {
                    // If it's a single string, split it or treat it as one code
                    codes = data.recovery_codes.includes(',') 
                        ? data.recovery_codes.split(',').map((code: string) => code.trim())
                        : [data.recovery_codes];
                }
                
                setRecoveryCodes(codes);
                setRecoveryCodesError('');
                
                // Show success message if available
                if (data.message) {
                    console.log('Success:', data.message);
                }
            } else {
                console.warn('Error regenerating recovery codes:', data);
                setRecoveryCodes([]);
                setRecoveryCodesError(data.error || 'Không thể tạo lại mã khôi phục. Vui lòng thử lại.');
            }
        })
        .catch(error => {
            console.error('Error regenerating recovery codes:', error);
            setRecoveryCodes([]);
            setRecoveryCodesError('Đã xảy ra lỗi khi tạo lại mã khôi phục. Vui lòng thử lại.');
        })
        .finally(() => {
            setIsLoadingRecoveryCodes(false);
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
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
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
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
                                    <Badge variant={customer?.email_verified_at ? "default" : "destructive"}>
                                        {customer?.email_verified_at ? "Đã xác thực" : "Chưa xác thực"}
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
                                    <Badge variant={customer?.kyc_verified_at ? "default" : "secondary"}>
                                        {customer?.kyc_verified_at ? "Đã xác thực" : "Chưa xác thực"}
                                    </Badge>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Đổi mật khẩu lần cuối</span>
                                    <span className="text-xs text-gray-500">
                                        {customer?.password_changed_at ? 
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
                                            {two_factor_enabled ? (
                                                <>
                                                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                                                    Đã bật xác thực 2 bước
                                                </>
                                            ) : (
                                                <>
                                                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                                                    Chưa bật xác thực 2 bước
                                                </>
                                            )}
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

                                    <Button 
                                        type="submit" 
                                        disabled={processing || !data.current_password || !data.password || !data.password_confirmation || data.password !== data.password_confirmation}
                                    >
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
                                <div className="space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-1">
                                            <p className="text-sm text-gray-600 mb-4">
                                                Xác thực hai bước giúp bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác thực từ thiết bị di động khi đăng nhập.
                                            </p>
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                                <div className="flex items-start">
                                                    <div className="flex-shrink-0">
                                                        <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                                                    </div>
                                                    <div className="ml-3">
                                                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Cần có ứng dụng xác thực trên điện thoại</h4>
                                                        <p className="text-xs text-blue-700">
                                                            Bạn cần cài đặt một trong các ứng dụng sau trên điện thoại:<br/>
                                                            • <strong>Google Authenticator</strong> (iOS/Android)<br/>
                                                            • <strong>Microsoft Authenticator</strong> (iOS/Android)<br/>
                                                            • <strong>Authy</strong> (iOS/Android)<br/>
                                                            • Hoặc ứng dụng xác thực TOTP khác
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                <Badge variant={two_factor_enabled ? "default" : "secondary"} className="text-sm">
                                                    {two_factor_enabled ? (
                                                        <div className="flex items-center space-x-1">
                                                            <CheckCircle className="w-3 h-3" />
                                                            <span>Đã bật</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center space-x-1">
                                                            <AlertTriangle className="w-3 h-3" />
                                                            <span>Chưa bật</span>
                                                        </div>
                                                    )}
                                                </Badge>
                                                {!two_factor_enabled ? (
                                                    <Button 
                                                        variant="default"
                                                        size="sm"
                                                        onClick={handleEnable2FA}
                                                        className="bg-green-600 hover:bg-green-700"
                                                    >
                                                        <Smartphone className="w-4 h-4 mr-2" />
                                                        Bật 2FA
                                                    </Button>
                                                ) : (
                                                    <div className="flex items-center space-x-2">
                                                        <Dialog open={showRecoveryCodes} onOpenChange={setShowRecoveryCodes}>
                                                            <DialogTrigger asChild>
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm"
                                                                    onClick={handleShowRecoveryCodes}
                                                                >
                                                                    <Key className="w-4 h-4 mr-2" />
                                                                    Xem mã khôi phục
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Mã khôi phục</DialogTitle>
                                                                    <DialogDescription>
                                                                        <div className="space-y-2">
                                                                            <p>Lưu trữ các mã này ở nơi an toàn. Mỗi mã chỉ có thể sử dụng một lần.</p>
                                                                            <div className="bg-amber-50 border border-amber-200 rounded p-2">
                                                                                <p className="text-xs text-amber-700">
                                                                                    <strong>Lưu ý:</strong> Sử dụng mã khôi phục khi bạn không thể truy cập ứng dụng xác thực trên điện thoại (mất điện thoại, xóa ứng dụng, v.v.)
                                                                                </p>
                                                                            </div>
                                                                        </div>
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                {isLoadingRecoveryCodes ? (
                                                                    <div className="flex justify-center py-4">
                                                                        <div className="text-sm text-gray-600">Đang tải mã khôi phục...</div>
                                                                    </div>
                                                                ) : recoveryCodesError ? (
                                                                    <div className="text-center py-4">
                                                                        <Alert className="mb-4">
                                                                            <AlertTriangle className="h-4 w-4" />
                                                                            <AlertDescription className="text-sm">
                                                                                {recoveryCodesError}
                                                                            </AlertDescription>
                                                                        </Alert>
                                                                        {recoveryCodesError.includes('2FA chưa được bật') && (
                                                                            <p className="text-xs text-gray-500 mt-2">
                                                                                Bạn cần bật 2FA trước khi có thể xem mã khôi phục.
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <div className=" gap-2 text-sm font-mono">
                                                                        {recoveryCodes.length > 0 ? (
                                                                            recoveryCodes.map((code, index) => (
                                                                                <div key={index} className="bg-gray-50 p-2 rounded border flex items-center justify-between">
                                                                                    <span>{code}</span>
                                                                                    <Button
                                                                                        variant="ghost"
                                                                                        size="sm"
                                                                                        onClick={() => copyToClipboard(code)}
                                                                                    >
                                                                                        <Copy className="w-3 h-3" />
                                                                                    </Button>
                                                                                </div>
                                                                            ))
                                                                        ) : (
                                                                            <div className="col-span-2 text-center py-4">
                                                                                <p className="text-sm text-gray-500">Không có mã khôi phục nào được tìm thấy.</p>
                                                                                <p className="text-xs text-gray-400 mt-1">Thử tạo lại mã khôi phục mới.</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </DialogContent>
                                                        </Dialog>
                                                        
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={handleRegenerateRecoveryCodes}
                                                        >
                                                            <RefreshCw className="w-4 h-4 mr-2" />
                                                            Tạo lại mã
                                                        </Button>
                                                        
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant="destructive" size="sm">
                                                                    <Shield className="w-4 h-4 mr-2" />
                                                                    Tắt 2FA
                                                                </Button>
                                                            </DialogTrigger>
                                                            <DialogContent>
                                                                <DialogHeader>
                                                                    <DialogTitle>Tắt xác thực hai bước</DialogTitle>
                                                                    <DialogDescription>
                                                                        Bạn có chắc chắn muốn tắt xác thực hai bước? Điều này sẽ làm giảm mức độ bảo mật tài khoản của bạn.
                                                                    </DialogDescription>
                                                                </DialogHeader>
                                                                <form onSubmit={handleDisable2FA} className="space-y-4">
                                                                    <div>
                                                                        <Label htmlFor="disable_password">Mật khẩu</Label>
                                                                        <div className="relative">
                                                                            <Input
                                                                                id="disable_password"
                                                                                type={showDisablePassword ? "text" : "password"}
                                                                                value={disableForm.data.password}
                                                                                onChange={(e) => disableForm.setData('password', e.target.value)}
                                                                                className="pr-10"
                                                                            />
                                                                            <button
                                                                                type="button"
                                                                                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                                                                onClick={() => setShowDisablePassword(!showDisablePassword)}
                                                                            >
                                                                                {showDisablePassword ? (
                                                                                    <EyeOff className="h-4 w-4 text-gray-400" />
                                                                                ) : (
                                                                                    <Eye className="h-4 w-4 text-gray-400" />
                                                                                )}
                                                                            </button>
                                                                        </div>
                                                                        {disableForm.errors.password && (
                                                                            <p className="text-sm text-red-600 mt-1">{disableForm.errors.password}</p>
                                                                        )}
                                                                    </div>
                                                                    
                                                                    <div className="flex space-x-2">
                                                                        <Button 
                                                                            type="submit" 
                                                                            variant="destructive"
                                                                            disabled={disableForm.processing}
                                                                            className="flex-1"
                                                                        >
                                                                            {disableForm.processing ? 'Đang tắt...' : 'Tắt 2FA'}
                                                                        </Button>
                                                                    </div>
                                                                </form>
                                                            </DialogContent>
                                                        </Dialog>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 2FA Setup Dialog */}
                                <Dialog open={isSettingUp2FA} onOpenChange={setIsSettingUp2FA}>
                                    <DialogContent className="max-w-md mx-auto">
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-bold">
                                                Thiết lập xác thực hai bước
                                            </DialogTitle>
                                        </DialogHeader>
                                        <DialogDescription>
                                            <div className="space-y-4">
                                                <p className="text-sm text-gray-600">
                                                    Để bảo mật tài khoản tốt hơn, hãy bật xác thực hai bước. Làm theo các bước sau:
                                                </p>
                                                
                                                {/* Step-by-step guide */}
                                                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                                    <h4 className="font-semibold text-gray-800 text-sm">Hướng dẫn thiết lập:</h4>
                                                    <div className="space-y-2 text-sm text-gray-600">
                                                        <div className="flex items-start">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-semibold mr-3 mt-0.5">1</span>
                                                            <div>
                                                                <p className="font-medium">Cài đặt ứng dụng xác thực</p>
                                                                <p className="text-xs text-gray-500">Tải Google Authenticator, Microsoft Authenticator hoặc Authy từ App Store/Play Store</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-semibold mr-3 mt-0.5">2</span>
                                                            <div>
                                                                <p className="font-medium">Quét mã QR</p>
                                                                <p className="text-xs text-gray-500">Mở ứng dụng và quét mã QR bên dưới hoặc nhập mã thiết lập thủ công</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-start">
                                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full text-xs flex items-center justify-center font-semibold mr-3 mt-0.5">3</span>
                                                            <div>
                                                                <p className="font-medium">Nhập mã xác thực</p>
                                                                <p className="text-xs text-gray-500">Nhập mã 6 chữ số hiển thị trong ứng dụng xác thực vào ô bên dưới</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* QR Code and Setup Key */}
                                            <div className="flex flex-col items-center">
                                                {twoFactorSetup?.qrCode && (
                                                    <div className="mb-4">
                                                        <img 
                                                            src={twoFactorSetup.qrCode} 
                                                            alt="QR Code for 2FA"
                                                            className="w-32 h-32 rounded-md border"
                                                        />
                                                    </div>
                                                )}
                                                <div className="flex items-center space-x-2 mb-4">
                                                    <span className="text-sm font-medium">Mã thiết lập:</span>
                                                    <Badge variant="outline" className="text-sm">
                                                        {twoFactorSetup?.setupKey}
                                                    </Badge>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => copyToClipboard(twoFactorSetup?.setupKey || '')}
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Confirmation Form */}
                                            <form onSubmit={handleConfirm2FA} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="confirmation_code">Mã xác thực</Label>
                                                    <Input
                                                        id="confirmation_code"
                                                        type="text"
                                                        placeholder="Nhập mã 6 chữ số"
                                                        value={confirmationForm.data.code}
                                                        onChange={(e) => confirmationForm.setData('code', e.target.value)}
                                                        maxLength={6}
                                                    />
                                                    {confirmationForm.errors.code && (
                                                        <p className="text-sm text-red-600 mt-1">{confirmationForm.errors.code}</p>
                                                    )}
                                                </div>
                                                
                                                <div className="flex space-x-2">
                                                    <Button 
                                                        type="submit" 
                                                        disabled={confirmationForm.processing}
                                                        className="flex-1"
                                                    >
                                                        {confirmationForm.processing ? 'Đang xác nhận...' : 'Xác nhận'}
                                                    </Button>
                                                    <Button 
                                                        type="button" 
                                                        variant="ghost"
                                                        onClick={() => setIsSettingUp2FA(false)}
                                                    >
                                                        Hủy
                                                    </Button>
                                                </div>
                                            </form>

                                            {/* Recovery Codes */}
                                            {twoFactorSetup?.recoveryCodes && (
                                                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                    <div className="flex items-center mb-2">
                                                        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                                                        <h4 className="font-medium text-yellow-800">Mã khôi phục</h4>
                                                    </div>
                                                    <p className="text-sm text-yellow-700 mb-3">
                                                        Lưu trữ các mã này ở nơi an toàn. Bạn có thể sử dụng chúng để truy cập tài khoản nếu mất thiết bị xác thực.
                                                    </p>
                                                    <div className="grid grid-cols-2 gap-2 text-sm font-mono">
                                                        {Array.isArray(twoFactorSetup.recoveryCodes) && twoFactorSetup.recoveryCodes.map((code, index) => (
                                                            <div key={index} className="bg-white p-2 rounded border">
                                                                {code}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </DialogDescription>
                                    </DialogContent>
                                </Dialog>
                            </CardContent>
                        </Card>

                        {/* Security Activity */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Clock className="w-5 h-5 mr-2 text-orange-600" />
                                    Hoạt động bảo mật gần đây
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {security_activities.length > 0 ? (
                                    <div className="space-y-4">
                                        {security_activities.slice(0, 5).map((activity) => (
                                            <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                                                <div className={`p-2 rounded-full ${getActivityColor(activity.activity, activity.is_suspicious)}`}>
                                                    {getActivityIcon(activity.activity)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {activity.activity}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {getRelativeTime(activity.created_at)}
                                                        </p>
                                                    </div>
                                                    <div className="mt-1 text-xs text-gray-500">
                                                        <p>IP: {activity.ip_address}</p>
                                                        <p className="truncate">{activity.user_agent}</p>
                                                    </div>
                                                    {activity.is_suspicious && (
                                                        <Alert className="mt-2">
                                                            <AlertTriangle className="h-4 w-4" />
                                                            <AlertDescription className="text-xs">
                                                                Hoạt động đáng ngờ - Kiểm tra ngay
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                        <div className="text-center">
                                            <Link href="/customer/profile/security/activity">
                                                <Button variant="ghost" size="sm">
                                                    Xem tất cả hoạt động
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-center text-gray-500 py-8">
                                        Chưa có hoạt động bảo mật nào được ghi nhận
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
