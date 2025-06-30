import React from 'react';
import { Head, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatVND } from '@/lib/currency';
import {
    ArrowUpDown,
    Coins,
    CreditCard,
    AlertCircle,
    Calculator
} from 'lucide-react';

interface Props {
    balance: {
        id: number;
        customer_id: number;
        balance: number;
        locked_balance: number;
        available_balance: number;
        created_at: string;
        updated_at: string;
    } | null;
    points: {
        id: number;
        customer_id: number;
        available_points: number;
        total_earned: number;
        total_spent: number;
        created_at: string;
        updated_at: string;
    } | null;
    exchangeRate: number;
}

export default function Exchange({ balance, points, exchangeRate }: Props) {
    const [exchangeType, setExchangeType] = React.useState<'balance_to_points' | 'points_to_balance'>('balance_to_points');
    const [amount, setAmount] = React.useState<string>('');
    const [isProcessing, setIsProcessing] = React.useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount || parseFloat(amount) <= 0) return;

        setIsProcessing(true);
        try {
            await router.post('/customer/points/exchange', {
                type: exchangeType,
                amount: parseFloat(amount)
            });
        } catch (error) {
            console.error('Exchange failed:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const calculateExchange = () => {
        const inputAmount = parseFloat(amount) || 0;
        if (exchangeType === 'balance_to_points') {
            return inputAmount / exchangeRate;
        } else {
            return inputAmount * exchangeRate;
        }
    };

    const canExchange = () => {
        const inputAmount = parseFloat(amount) || 0;
        if (exchangeType === 'balance_to_points') {
            return balance && balance.available_balance >= inputAmount;
        } else {
            return points && points.available_points >= inputAmount;
        }
    };

    return (
        <CustomerLayout>
            <Head title="Đổi điểm" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Đổi điểm</h1>
                        <p className="text-gray-600">Đổi điểm thành số dư hoặc ngược lại</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Current Balance & Points */}
                    <div className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5" />
                                    Số dư hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                    {balance ? formatVND(balance.available_balance) : formatVND(0)}
                                </div>
                                <p className="text-sm text-gray-500">Số dư khả dụng</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Coins className="h-5 w-5" />
                                    Điểm hiện tại
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                    {points?.available_points?.toLocaleString() || '0'}
                                </div>
                                <p className="text-sm text-gray-500">Điểm khả dụng</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Exchange Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <ArrowUpDown className="h-5 w-5" />
                                Đổi điểm
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Exchange Type */}
                                <div className="space-y-3">
                                    <Label>Loại đổi điểm</Label>
                                    <RadioGroup
                                        value={exchangeType}
                                        onValueChange={(value) => setExchangeType(value as 'balance_to_points' | 'points_to_balance')}
                                    >
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="balance_to_points" id="balance_to_points" />
                                            <Label htmlFor="balance_to_points">Số dư → Điểm</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="points_to_balance" id="points_to_balance" />
                                            <Label htmlFor="points_to_balance">Điểm → Số dư</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                {/* Amount Input */}
                                <div className="space-y-2">
                                    <Label htmlFor="amount">
                                        {exchangeType === 'balance_to_points' ? 'Số tiền (VND)' : 'Số điểm'}
                                    </Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        min="1"
                                        step={exchangeType === 'balance_to_points' ? '1000' : '1'}
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        placeholder={exchangeType === 'balance_to_points' ? 'Nhập số tiền' : 'Nhập số điểm'}
                                    />
                                </div>

                                {/* Exchange Rate Info */}
                                <Alert>
                                    <Calculator className="h-4 w-4" />
                                    <AlertDescription>
                                        Tỷ lệ đổi: {formatVND(exchangeRate)} = 1 điểm
                                        {amount && (
                                            <div className="mt-2 font-medium">
                                                {exchangeType === 'balance_to_points' 
                                                    ? `${formatVND(parseFloat(amount) || 0)} → ${calculateExchange().toFixed(0)} điểm`
                                                    : `${parseFloat(amount) || 0} điểm → ${formatVND(calculateExchange())}`
                                                }
                                            </div>
                                        )}
                                    </AlertDescription>
                                </Alert>

                                {/* Insufficient Balance Warning */}
                                {amount && !canExchange() && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            {exchangeType === 'balance_to_points' 
                                                ? 'Số dư không đủ để thực hiện giao dịch này'
                                                : 'Số điểm không đủ để thực hiện giao dịch này'
                                            }
                                        </AlertDescription>
                                    </Alert>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={!amount || !canExchange() || isProcessing}
                                >
                                    {isProcessing ? 'Đang xử lý...' : 'Đổi điểm'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </CustomerLayout>
    );
}
