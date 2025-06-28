import React, { useState, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock, User, Phone, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/AuthLayout';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { RegisterForm, Customer } from '@/types';

interface RegisterPageProps {
    errors?: Record<string, string>;
    message?: string;
    referralCode?: string;
}

export default function CustomerRegister({ errors = {}, message, referralCode }: RegisterPageProps) {
    const { login } = useCustomerAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState<RegisterForm>({
        username: '',
        email: '',
        password: '',
        password_confirmation: '',
        phone: '',
        referral_code: referralCode || '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        
        if (!agreedToTerms) {
            alert('Vui lòng đồng ý với điều khoản sử dụng');
            return;
        }
        
        setLoading(true);

        try {
            router.post('/customer/register', formData as unknown as Record<string, string>, {
                onSuccess: (page) => {
                    const customer = (page.props as { customer?: Customer }).customer;
                    if (customer) {
                        login();
                        router.visit('/customer/dashboard');
                    }
                },
                onError: () => {
                    setLoading(false);
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            setLoading(false);
            console.error('Register error:', error);
        }
    };

    const handleInputChange = (field: keyof RegisterForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AuthLayout title="Đăng ký">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Tạo tài khoản mới
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Hoặc{' '}
                            <Link 
                                href="/customer/login" 
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                đăng nhập với tài khoản có sẵn
                            </Link>
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chào mừng bạn!</CardTitle>
                            <CardDescription>
                                Tạo tài khoản để bắt đầu giao dịch an toàn
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {message && (
                                <Alert className="mb-4">
                                    <AlertDescription>{message}</AlertDescription>
                                </Alert>
                            )}

                            {Object.keys(errors).length > 0 && (
                                <Alert variant="destructive" className="mb-4">
                                    <AlertDescription>
                                        {Object.values(errors).map((error, index) => (
                                            <div key={index}>{error}</div>
                                        ))}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {referralCode && (
                                <Alert className="mb-4">
                                    <AlertDescription>
                                        🎉 Bạn được giới thiệu với mã: <strong>{referralCode}</strong>
                                        <br />
                                        <small className="text-gray-600">Mã giới thiệu đã được điền sẵn và không thể thay đổi.</small>
                                    </AlertDescription>
                                </Alert>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div >
                                    <Label htmlFor="username" className="block mb-2">Username *</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Chọn username duy nhất"
                                            value={formData.username}
                                            onChange={(e) => handleInputChange('username', e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.username && (
                                        <p className="text-sm text-red-600">{errors.username}</p>
                                    )}
                                </div>

                                <div >
                                    <Label htmlFor="email" className="block mb-2">Email *</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Nhập địa chỉ email"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600">{errors.email}</p>
                                    )}
                                </div>

                                <div >
                                    <Label htmlFor="phone" className="block mb-2">Số điện thoại</Label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="phone"
                                            type="tel"
                                            placeholder="Nhập số điện thoại (tùy chọn)"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    {errors.phone && (
                                        <p className="text-sm text-red-600">{errors.phone}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="password" className="block mb-2">Mật khẩu *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Tạo mật khẩu mạnh"
                                            value={formData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            className="pl-10 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="text-sm text-red-600">{errors.password}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="password_confirmation" className="block mb-2">Xác nhận mật khẩu *</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu"
                                            value={formData.password_confirmation}
                                            onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                            className="pl-10 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <Label htmlFor="referral_code" className="block mb-2">Mã giới thiệu</Label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="referral_code"
                                            type="text"
                                            placeholder={referralCode ? "Mã giới thiệu đã được áp dụng" : "Mã giới thiệu (nếu có)"}
                                            value={formData.referral_code}
                                            onChange={(e) => handleInputChange('referral_code', e.target.value)}
                                            className={`pl-10 ${referralCode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                            disabled={!!referralCode}
                                        />
                                    </div>
                                    {errors.referral_code && (
                                        <p className="text-sm text-red-600">{errors.referral_code}</p>
                                    )}
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="terms"
                                        checked={agreedToTerms}
                                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                                    />
                                    <Label htmlFor="terms" className="text-sm">
                                        Tôi đồng ý với{' '}
                                        <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                            Điều khoản sử dụng
                                        </Link>{' '}
                                        và{' '}
                                        <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                            Chính sách bảo mật
                                        </Link>
                                    </Label>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading || !agreedToTerms}
                                >
                                    {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">
                                            Đã có tài khoản?
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link href="/customer/login">
                                        <Button variant="outline" className="w-full">
                                            Đăng nhập ngay
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-gray-600">
                        <p>
                            🎁 Nhận ngay <strong>bonus điểm C</strong> khi đăng ký thành công!
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
