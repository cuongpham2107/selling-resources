import React, { useState, FormEvent } from 'react';
import { Link, router } from '@inertiajs/react';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/AuthLayout';

interface ForgotPasswordProps {
    status?: string;
    errors?: Record<string, string>;
}

export default function ForgotPassword({ status, errors = {} }: ForgotPasswordProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        router.post('/forgot-password', { email }, {
            onSuccess: () => {
                setSubmitted(true);
                setLoading(false);
            },
            onError: () => {
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    if (submitted || status) {
        return (
            <AuthLayout title="Quên mật khẩu">
                <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full space-y-8">
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                                <Send className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900">
                                Email đã được gửi!
                            </h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Chúng tôi đã gửi link đặt lại mật khẩu đến email của bạn
                            </p>
                        </div>

                        <Card>
                            <CardContent className="pt-6">
                                {status && (
                                    <Alert className="mb-4 border-green-200 bg-green-50">
                                        <AlertDescription className="text-green-800">
                                            {status}
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <div className="bg-blue-50 p-4 rounded-lg mb-4">
                                    <h3 className="font-medium text-blue-900 mb-2">
                                        Hướng dẫn đặt lại mật khẩu:
                                    </h3>
                                    <ol className="text-sm text-blue-800 space-y-1">
                                        <li>1. Kiểm tra hộp thư email: <strong>{email}</strong></li>
                                        <li>2. Tìm email từ hệ thống của chúng tôi</li>
                                        <li>3. Nhấp vào liên kết "Đặt lại mật khẩu"</li>
                                        <li>4. Nhập mật khẩu mới và xác nhận</li>
                                    </ol>
                                </div>

                                <div className="bg-yellow-50 p-4 rounded-lg mb-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Lưu ý:</strong> Nếu không thấy email trong hộp thư chính, 
                                        vui lòng kiểm tra thư mục spam/junk mail. Link sẽ hết hạn sau 60 phút.
                                    </p>
                                </div>

                                <div className="space-y-3">
                                    <Button 
                                        onClick={() => router.post('/forgot-password', { email })}
                                        variant="outline" 
                                        className="w-full"
                                        disabled={loading}
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Gửi lại email
                                    </Button>

                                    <Link href="/login">
                                        <Button variant="ghost" className="w-full">
                                            <ArrowLeft className="h-4 w-4 mr-2" />
                                            Quay lại đăng nhập
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title="Quên mật khẩu">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Quên mật khẩu?
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Đừng lo lắng! Nhập email và chúng tôi sẽ gửi link đặt lại mật khẩu
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Đặt lại mật khẩu</CardTitle>
                            <CardDescription>
                                Nhập địa chỉ email tài khoản của bạn
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
                                        Địa chỉ email
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="Nhập địa chỉ email của bạn"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-10"
                                            required
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full" 
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Send className="h-4 w-4 mr-2 animate-pulse" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-4 w-4 mr-2" />
                                            Gửi link đặt lại mật khẩu
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
                            Chưa có tài khoản?{' '}
                            <Link href="/register" className="text-blue-600 hover:text-blue-500">
                                Đăng ký ngay
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
