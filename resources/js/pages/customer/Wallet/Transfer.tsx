import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Send, AlertTriangle, Wallet, User, ArrowRight } from 'lucide-react';
import type { CustomerBalance } from '@/types';

interface Props {
    balance: CustomerBalance | null;
}

export default function Transfer({ balance }: Props) {
    const [recipientUsername, setRecipientUsername] = useState('');
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
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

    const quickAmounts = [50000, 100000, 500000, 1000000, 2000000];

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});

        const numAmount = parseInt(amount);
        
        // Validation
        const newErrors: Record<string, string> = {};
        
        if (!recipientUsername) {
            newErrors.recipient_username = 'Vui lòng nhập tên người nhận';
        }
        
        if (!amount || numAmount < 10000) {
            newErrors.amount = 'Số tiền chuyển tối thiểu là 10,000 VNĐ';
        }
        
        if (balance && numAmount > balance.balance) {
            newErrors.amount = 'Số dư không đủ để thực hiện giao dịch';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setLoading(false);
            return;
        }

        router.post(route('customer.wallet.transfer.process'), {
            recipient_username: recipientUsername,
            amount: numAmount,
            note: note || undefined,
        }, {
            onSuccess: () => {
                // Reset form
                setRecipientUsername('');
                setAmount('');
                setNote('');
            },
            onError: (errors) => {
                setErrors(errors);
            },
            onFinish: () => {
                setLoading(false);
            }
        });
    };

    const transferFee = amount ? parseInt(amount) * 0.02 : 0;
    const netAmount = amount ? parseInt(amount) - transferFee : 0;

    return (
        <CustomerLayout>
            <Head title="Chuyển tiền" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href={route('customer.wallet.index')}>
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Chuyển tiền</h1>
                        <p className="text-gray-600">Chuyển tiền cho người dùng khác trong hệ thống</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Transfer Form */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Send className="h-5 w-5" />
                                    Thông tin chuyển tiền
                                </CardTitle>
                                <CardDescription>
                                    Nhập thông tin người nhận và số tiền cần chuyển
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Recipient Username */}
                                    <div className="space-y-2">
                                        <Label htmlFor="recipient_username">
                                            Tên người nhận <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="recipient_username"
                                                type="text"
                                                value={recipientUsername}
                                                onChange={(e) => setRecipientUsername(e.target.value)}
                                                placeholder="Nhập username của người nhận"
                                                className="pl-10"
                                            />
                                        </div>
                                        {errors.recipient_username && (
                                            <p className="text-sm text-red-600">{errors.recipient_username}</p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div className="space-y-2">
                                        <Label htmlFor="amount">
                                            Số tiền <span className="text-red-500">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="amount"
                                                type="text"
                                                value={formatCurrency(amount)}
                                                onChange={handleAmountChange}
                                                placeholder="Nhập số tiền cần chuyển"
                                                className="pl-10"
                                            />
                                            <div className="absolute right-3 top-3 text-sm text-gray-500">
                                                VNĐ
                                            </div>
                                        </div>
                                        {errors.amount && (
                                            <p className="text-sm text-red-600">{errors.amount}</p>
                                        )}
                                        
                                        {/* Quick Amount Buttons */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {quickAmounts.map((quickAmount) => (
                                                <Button
                                                    key={quickAmount}
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setAmount(quickAmount.toString())}
                                                    disabled={balance ? quickAmount > balance.balance : true}
                                                >
                                                    {new Intl.NumberFormat('vi-VN').format(quickAmount)}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Note */}
                                    <div className="space-y-2">
                                        <Label htmlFor="note">Ghi chú (tùy chọn)</Label>
                                        <Textarea
                                            id="note"
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Nhập ghi chú cho giao dịch (tối đa 200 ký tự)"
                                            maxLength={200}
                                            rows={3}
                                        />
                                        <p className="text-sm text-gray-500">
                                            {note.length}/200 ký tự
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={loading || !recipientUsername || !amount}
                                    >
                                        {loading ? 'Đang xử lý...' : 'Chuyển tiền'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transfer Summary */}
                    <div className="space-y-6">
                        {/* Balance Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Số dư hiện tại</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {balance ? 
                                        new Intl.NumberFormat('vi-VN', { 
                                            style: 'currency', 
                                            currency: 'VND' 
                                        }).format(balance.balance)
                                        : '0 VNĐ'
                                    }
                                </div>
                                <p className="text-sm text-gray-500 mt-1">Số dư khả dụng</p>
                            </CardContent>
                        </Card>

                        {/* Transfer Summary */}
                        {amount && parseInt(amount) > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Tóm tắt giao dịch</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Số tiền chuyển:</span>
                                        <span className="font-semibold">
                                            {new Intl.NumberFormat('vi-VN', { 
                                                style: 'currency', 
                                                currency: 'VND' 
                                            }).format(parseInt(amount))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-red-600">
                                        <span>Phí chuyển tiền (2%):</span>
                                        <span>
                                            -{new Intl.NumberFormat('vi-VN', { 
                                                style: 'currency', 
                                                currency: 'VND' 
                                            }).format(transferFee)}
                                        </span>
                                    </div>
                                    <hr />
                                    <div className="flex justify-between font-semibold">
                                        <span>Người nhận được:</span>
                                        <span className="text-green-600">
                                            {new Intl.NumberFormat('vi-VN', { 
                                                style: 'currency', 
                                                currency: 'VND' 
                                            }).format(netAmount)}
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Important Notes */}
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                                <div className="space-y-2 text-sm">
                                    <p><strong>Lưu ý quan trọng:</strong></p>
                                    <ul className="list-disc list-inside space-y-1">
                                        <li>Phí chuyển tiền là 2% số tiền chuyển</li>
                                        <li>Số tiền tối thiểu: 10,000 VNĐ</li>
                                        <li>Không thể chuyển tiền cho chính mình</li>
                                        <li>Giao dịch sẽ được thực hiện ngay lập tức</li>
                                        <li>Kiểm tra kỹ username người nhận</li>
                                    </ul>
                                </div>
                            </AlertDescription>
                        </Alert>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
