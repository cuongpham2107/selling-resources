import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, CreditCard, Wallet, AlertTriangle } from 'lucide-react';

export default function Topup() {
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const formatCurrency = (value: string) => {
        const num = parseInt(value.replace(/[^\d]/g, ''));
        if (isNaN(num)) return '';
        return new Intl.NumberFormat('vi-VN').format(num);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^\d]/g, '');
        setAmount(value);
    };

    const quickAmounts = [10000, 50000, 100000, 500000, 1000000, 5000000];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setErrors({});
        
        try {
            // For VNPay payment, use traditional form submission to handle redirect
            if (paymentMethod === 'vnpay') {
                // Get CSRF token
                const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
                
                if (!csrfToken) {
                    setErrors({ payment_method: 'Vui lòng tải lại trang.' });
                    return;
                }
                
                // Create a form and submit it traditionally to handle redirect
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = '/customer/wallet/topup';
                
                // Add CSRF token
                const csrfInput = document.createElement('input');
                csrfInput.type = 'hidden';
                csrfInput.name = '_token';
                csrfInput.value = csrfToken;
                form.appendChild(csrfInput);
                
                // Add amount
                const amountInput = document.createElement('input');
                amountInput.type = 'hidden';
                amountInput.name = 'amount';
                amountInput.value = amount;
                form.appendChild(amountInput);
                
                // Add payment method
                const paymentMethodInput = document.createElement('input');
                paymentMethodInput.type = 'hidden';
                paymentMethodInput.name = 'payment_method';
                paymentMethodInput.value = paymentMethod;
                form.appendChild(paymentMethodInput);
                
                // console.log('Form data:', {
                //     _token: csrfToken,
                //     amount: amount,
                //     payment_method: paymentMethod
                // });
                
                document.body.appendChild(form);
                form.submit();
                return;
            }
            
            // For other payment methods, use Inertia as normal
            await router.post('/customer/wallet/topup', {
                amount: parseInt(amount),
                payment_method: paymentMethod,
            });
            
        } catch (error: unknown) {
            console.error('Payment error:', error);
            if (error && typeof error === 'object' && 'response' in error && 
                error.response && typeof error.response === 'object' && 
                'data' in error.response && error.response.data && 
                typeof error.response.data === 'object' && 'errors' in error.response.data) {
                setErrors(error.response.data.errors as Record<string, string>);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CustomerLayout>
            <Head title="Nạp Tiền" />
            
            <div className="space-y-6 mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/wallet">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <CreditCard className="w-6 h-6 mr-2" />
                                Nạp tiền vào ví
                            </h1>
                            <p className="text-gray-600">Nạp tiền vào ví để thực hiện giao dịch</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Topup Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin nạp tiền</CardTitle>
                            <CardDescription>
                                Nhập số tiền bạn muốn nạp vào ví
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="amount">Số tiền nạp (VNĐ)</Label>
                                    <Input
                                        id="amount"
                                        type="text"
                                        placeholder="Nhập số tiền..."
                                        value={formatCurrency(amount)}
                                        onChange={handleAmountChange}
                                        className="mt-1"
                                    />
                                    {errors.amount && (
                                        <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                                    )}
                                    <p className="text-xs text-gray-500 mt-1">
                                        Tối thiểu: 10,000 VNĐ - Tối đa: 50,000,000 VNĐ
                                    </p>
                                </div>

                                {/* Quick Amount Selection */}
                                <div>
                                    <Label>Chọn nhanh</Label>
                                    <div className="grid grid-cols-3 gap-2 mt-2">
                                        {quickAmounts.map((quickAmount) => (
                                            <Button
                                                key={quickAmount}
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAmount(quickAmount.toString())}
                                                className="text-xs"
                                            >
                                                {new Intl.NumberFormat('vi-VN').format(quickAmount)}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="payment_method">Phương thức thanh toán</Label>
                                    <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Chọn phương thức thanh toán" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="vnpay">Chuyển khoản ngân hàng</SelectItem>
                                            {/* <SelectItem value="momo">Ví MoMo</SelectItem>
                                            <SelectItem value="zalo_pay">ZaloPay</SelectItem> */}
                                        </SelectContent>
                                    </Select>
                                    {errors.payment_method && (
                                        <p className="text-red-500 text-xs mt-1">{errors.payment_method}</p>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={loading || !amount || !paymentMethod}
                                    className="w-full"
                                >
                                    {loading ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info & Guidelines */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Wallet className="w-5 h-5 mr-2" />
                                    Hướng dẫn nạp tiền
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 1</p>
                                            <p className="text-gray-600">Nhập số tiền và chọn phương thức thanh toán</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 2</p>
                                            <p className="text-gray-600">Thực hiện thanh toán theo hướng dẫn</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 3</p>
                                            <p className="text-gray-600">Tiền sẽ được nạp vào ví trong vòng 5-10 phút</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                Lưu ý: Phí giao dịch có thể được áp dụng tùy theo phương thức thanh toán. 
                                Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
