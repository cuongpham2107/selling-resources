import React, { useState, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/AuthLayout';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { LoginForm, Customer } from '@/types';

interface LoginPageProps {
    errors?: Record<string, string>;
    message?: string;
}

export default function CustomerLogin({ errors = {}, message }: LoginPageProps) {
    const { login } = useCustomerAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<LoginForm>({
        username: '',
        password: '',
        remember: false,
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            router.post('/customer/login', formData as unknown as Record<string, string | boolean>, {
                onSuccess: (page) => {
                    // Assuming the response contains customer data
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
            console.error('Login error:', error);
        }
    };

    const handleInputChange = (field: keyof LoginForm, value: string | boolean) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AuthLayout title="Đăng nhập">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                       
                        <h2 className="mt-6 text-3xl font-bold text-gray-900">
                            Đăng nhập tài khoản
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Hoặc{' '}
                            <Link 
                                href="/customer/register" 
                                className="font-medium text-blue-600 hover:text-blue-500"
                            >
                                tạo tài khoản mới
                            </Link>
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Chào mừng trở lại!</CardTitle>
                            <CardDescription>
                                Đăng nhập để truy cập vào tài khoản của bạn
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

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="mb-4">
                                    <Label htmlFor="username" className="block mb-2">Username hoặc Email</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="username"
                                            type="text"
                                            placeholder="Nhập username hoặc email"
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

                                <div className="mb-4">
                                    <Label htmlFor="password" className="block mb-2">Mật khẩu</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu"
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

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="remember"
                                            checked={formData.remember}
                                            onCheckedChange={(checked) => handleInputChange('remember', checked as boolean)}
                                        />
                                        <Label htmlFor="remember" className="text-sm">
                                            Ghi nhớ đăng nhập
                                        </Label>
                                    </div>
                                    {/* TODO: Implement forgot password functionality */}
                                    {/* <Link 
                                        href="/customer/forgot-password" 
                                        className="text-sm text-blue-600 hover:text-blue-500"
                                    >
                                        Quên mật khẩu?
                                    </Link> */}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading}
                                >
                                    {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                                </Button>
                            </form>

                            <div className="mt-6">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-2 bg-white text-gray-500">
                                            Lần đầu sử dụng?
                                        </span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Link href="/customer/register">
                                        <Button variant="outline" className="w-full">
                                            Tạo tài khoản mới
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-gray-600">
                        <p>
                            Bằng việc đăng nhập, bạn đồng ý với{' '}
                            <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                                Điều khoản sử dụng
                            </Link>{' '}
                            và{' '}
                            <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                                Chính sách bảo mật
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
