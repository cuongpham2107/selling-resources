import React, { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Mail, RotateCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import AuthLayout from '@/layouts/AuthLayout';

interface VerifyEmailProps {
    status?: string;
}

export default function VerifyEmail({ status }: VerifyEmailProps) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(status);

    const handleResendEmail = () => {
        setLoading(true);
        
        router.post('/email/verification-notification', {}, {
            onSuccess: () => {
                setMessage('Đã gửi lại email xác thực! Vui lòng kiểm tra hộp thư của bạn.');
                setLoading(false);
            },
            onError: () => {
                setMessage('Có lỗi xảy ra khi gửi email. Vui lòng thử lại sau.');
                setLoading(false);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    return (
        <AuthLayout title="Xác thực email">
            <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                            <Mail className="h-8 w-8 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">
                            Xác thực email của bạn
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Chúng tôi đã gửi một email xác thực đến địa chỉ email của bạn
                        </p>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Đăng ký thành công!
                            </CardTitle>
                            <CardDescription>
                                Để hoàn tất quá trình đăng ký, vui lòng kiểm tra email và nhấp vào liên kết xác thực.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {message && (
                                <Alert className={message.includes('lỗi') ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                                    <AlertCircle className={`h-4 w-4 ${message.includes('lỗi') ? 'text-red-600' : 'text-green-600'}`} />
                                    <AlertDescription className={message.includes('lỗi') ? 'text-red-800' : 'text-green-800'}>
                                        {message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h3 className="font-medium text-blue-900 mb-2">
                                    Hướng dẫn xác thực:
                                </h3>
                                <ol className="text-sm text-blue-800 space-y-1">
                                    <li>1. Kiểm tra hộp thư email của bạn</li>
                                    <li>2. Tìm email từ hệ thống của chúng tôi</li>
                                    <li>3. Nhấp vào liên kết "Xác thực email"</li>
                                    <li>4. Bạn sẽ được chuyển hướng để đăng nhập</li>
                                </ol>
                            </div>

                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="text-sm text-yellow-800">
                                    <strong>Lưu ý:</strong> Nếu không thấy email trong hộp thư chính, 
                                    vui lòng kiểm tra thư mục spam/junk mail.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <Button 
                                    onClick={handleResendEmail}
                                    disabled={loading}
                                    className="w-full"
                                    variant="outline"
                                >
                                    {loading ? (
                                        <>
                                            <RotateCcw className="h-4 w-4 mr-2 animate-spin" />
                                            Đang gửi...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-4 w-4 mr-2" />
                                            Gửi lại email xác thực
                                        </>
                                    )}
                                </Button>

                                <div className="text-center text-sm text-gray-600">
                                    <span>Đã có tài khoản và đã xác thực? </span>
                                    <Link 
                                        href="/login" 
                                        className="font-medium text-blue-600 hover:text-blue-500"
                                    >
                                        Đăng nhập ngay
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="text-center text-xs text-gray-500">
                        <p>
                            Nếu bạn gặp vấn đề với việc xác thực email, 
                            vui lòng liên hệ hỗ trợ khách hàng của chúng tôi.
                        </p>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
