import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, ArrowDownToLine, AlertTriangle, Wallet } from 'lucide-react';
import type { CustomerBalance } from '@/types';

interface Props {
    balance: CustomerBalance | null;
    minWithdraw: number;
}

export default function Withdraw({ balance, minWithdraw }: Props) {
    const [amount, setAmount] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
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

    const maxWithdraw = balance?.balance || 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        setLoading(true);
        setErrors({});

        try {
            await router.post('/customer/wallet/withdraw', {
                amount: parseInt(amount),
                bank_name: bankName,
                account_number: accountNumber,
                account_holder: accountHolder,
            });
        } catch (error: unknown) {
            console.error('Withdrawal error:', error);
        } finally {
            setLoading(false);
        }
    };

    const quickAmounts = [50000, 100000, 500000, 1000000];

    return (
        <CustomerLayout>
            <Head title="Rút Tiền" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/wallet">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <ArrowDownToLine className="w-6 h-6 mr-2" />
                                Rút tiền từ ví
                            </h1>
                            <p className="text-gray-600">Rút tiền từ ví về tài khoản ngân hàng</p>
                        </div>
                    </div>
                </div>

                {/* Balance Info */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Wallet className="w-8 h-8 text-green-600" />
                                <div>
                                    <p className="text-sm text-gray-600">Số dư hiện tại</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {balance ? new Intl.NumberFormat('vi-VN', {
                                            style: 'currency',
                                            currency: 'VND'
                                        }).format(balance.balance) : '0 VNĐ'}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Tối thiểu rút</p>
                                <p className="font-medium">
                                    {new Intl.NumberFormat('vi-VN', {
                                        style: 'currency',
                                        currency: 'VND'
                                    }).format(minWithdraw)}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Withdrawal Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin rút tiền</CardTitle>
                            <CardDescription>
                                Nhập thông tin tài khoản ngân hàng và số tiền muốn rút
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <Label htmlFor="amount">Số tiền rút (VNĐ)</Label>
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
                                        Tối thiểu: {new Intl.NumberFormat('vi-VN').format(minWithdraw)} VNĐ - 
                                        Tối đa: {new Intl.NumberFormat('vi-VN').format(maxWithdraw)} VNĐ
                                    </p>
                                </div>

                                {/* Quick Amount Selection */}
                                <div>
                                    <Label>Chọn nhanh</Label>
                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                        {quickAmounts
                                            .filter(quickAmount => quickAmount <= maxWithdraw)
                                            .map((quickAmount) => (
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
                                        {maxWithdraw > 1000000 && (
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setAmount(maxWithdraw.toString())}
                                                className="text-xs"
                                            >
                                                Tất cả
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="bank_name">Tên ngân hàng</Label>
                                    <Input
                                        id="bank_name"
                                        type="text"
                                        placeholder="Ví dụ: Vietcombank, BIDV, Techcombank..."
                                        value={bankName}
                                        onChange={(e) => setBankName(e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.bank_name && (
                                        <p className="text-red-500 text-xs mt-1">{errors.bank_name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="account_number">Số tài khoản</Label>
                                    <Input
                                        id="account_number"
                                        type="text"
                                        placeholder="Nhập số tài khoản ngân hàng"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value)}
                                        className="mt-1"
                                    />
                                    {errors.account_number && (
                                        <p className="text-red-500 text-xs mt-1">{errors.account_number}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="account_holder">Tên chủ tài khoản</Label>
                                    <Input
                                        id="account_holder"
                                        type="text"
                                        placeholder="Nhập tên chủ tài khoản (viết hoa, không dấu)"
                                        value={accountHolder}
                                        onChange={(e) => setAccountHolder(e.target.value.toUpperCase())}
                                        className="mt-1"
                                    />
                                    {errors.account_holder && (
                                        <p className="text-red-500 text-xs mt-1">{errors.account_holder}</p>
                                    )}
                                </div>

                                <Button 
                                    type="submit" 
                                    disabled={loading || !amount || !bankName || !accountNumber || !accountHolder}
                                    className="w-full"
                                >
                                    {loading ? 'Đang xử lý...' : 'Gửi yêu cầu rút tiền'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Info & Guidelines */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Quy trình rút tiền</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 1: Gửi yêu cầu</p>
                                            <p className="text-gray-600">Điền đầy đủ thông tin và gửi yêu cầu rút tiền</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 2: Xét duyệt</p>
                                            <p className="text-gray-600">Hệ thống sẽ xét duyệt yêu cầu trong 2-4 giờ</p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                        <div>
                                            <p className="font-medium">Bước 3: Chuyển tiền</p>
                                            <p className="text-gray-600">Tiền sẽ được chuyển vào tài khoản trong 24 giờ</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <strong>Lưu ý quan trọng:</strong>
                                <ul className="mt-2 space-y-1 text-sm">
                                    <li>• Kiểm tra kỹ thông tin tài khoản trước khi gửi</li>
                                    <li>• Tên chủ tài khoản phải viết hoa và không dấu</li>
                                    <li>• Phí rút tiền: 11,000 VNĐ/giao dịch</li>
                                    <li>• Thời gian xử lý: 2-24 giờ (ngày làm việc)</li>
                                </ul>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
