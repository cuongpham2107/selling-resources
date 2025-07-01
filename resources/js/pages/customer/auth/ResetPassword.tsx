import React, { useState, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { Eye, EyeOff, Lock, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/AuthLayout';

interface ResetPasswordProps {
    token: string;
    email: string;
    errors?: Record<string, string>;
}

interface ResetPasswordForm {
    token: string;
    email: string;
    password: string;
    password_confirmation: string;
}

export default function ResetPassword({ token, email, errors = {} }: ResetPasswordProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<ResetPasswordForm>({
        token,
        email,
        password: '',
        password_confirmation: '',
    });

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post('/reset-password', formData as unknown as Record<string, string>, {
            onSuccess: () => {
                // Will redirect to login page with success message
            },
            onError: () => {
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const handleInputChange = (field: keyof ResetPasswordForm, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <AuthLayout title="Đặt lại mật khẩu">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                            <Lock className="h-8 w-8 text-green-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Đặt lại mật khẩu
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Tạo mật khẩu mới cho tài khoản của bạn
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Mật khẩu mới</CardTitle>
                            <CardDescription>
                                Mật khẩu của bạn phải có ít nhất 8 ký tự
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                <div>
                                    <Label htmlFor="email" className="block mb-2">
                                        Email
                                    </Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        className="bg-gray-50"
                                        disabled
                                        readOnly
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="password" className="block mb-2">
                                        Mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Nhập mật khẩu mới"
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
                                        <p className="text-sm text-red-600 mt-1">{errors.password}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="password_confirmation" className="block mb-2">
                                        Xác nhận mật khẩu mới
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="password_confirmation"
                                            type={showPasswordConfirmation ? 'text' : 'password'}
                                            placeholder="Nhập lại mật khẩu mới"
                                            value={formData.password_confirmation}
                                            onChange={(e) => handleInputChange('password_confirmation', e.target.value)}
                                            className="pl-10 pr-10"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                            onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        >
                                            {showPasswordConfirmation ? (
                                                <EyeOff className="h-4 w-4" />
                                            ) : (
                                                <Eye className="h-4 w-4" />
                                            )}
                                        </button>
                                    </div>
                                    {errors.password_confirmation && (
                                        <p className="text-sm text-red-600 mt-1">{errors.password_confirmation}</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        Yêu cầu mật khẩu:
                                    </h3>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Ít nhất 8 ký tự</li>
                                        <li>• Nên có chữ hoa và chữ thường</li>
                                        <li>• Nên có số và ký tự đặc biệt</li>
                                    </ul>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Save className="h-4 w-4 mr-2 animate-pulse" />
                                            Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-4 w-4 mr-2" />
                                            Cập nhật mật khẩu
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link 
                                    href="/login" 
                                    className="text-sm text-blue-600 hover:text-blue-500 inline-flex items-center"
                                >
                                    <ArrowLeft className="h-4 w-4 mr-1" />
                                    Quay lại đăng nhập
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-sm text-gray-600">
                        <p>
                            Sau khi đặt lại mật khẩu thành công, bạn sẽ được chuyển về trang đăng nhập
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
