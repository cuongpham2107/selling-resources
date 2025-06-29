import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useCustomerAuth } from '@/hooks/useCustomerAuth';
import { calculatePointsReward, calculateTransactionFee, formatVND } from '@/lib/currency';
import { CreateTransactionForm } from '@/types';
import { router } from '@inertiajs/react';
import { AlertTriangle, ArrowRightLeft, Calculator, DollarSign, FileText, User } from 'lucide-react';
import React, { FormEvent, useEffect, useRef, useState } from 'react';

interface TransactionFormProps {
    errors?: Record<string, string>;
    message?: string;
    initialPartnerUsername?: string;
    onSuccess?: () => void;
    isInDialog?: boolean;
    renderButtons?: (props: {
        loading: boolean;
        canSubmit: boolean;
        onCancel: () => void;
        onSubmit: () => void;
    }) => React.ReactNode;
}

export default function TransactionForm({ errors = {}, message, initialPartnerUsername, onSuccess, isInDialog = false, renderButtons }: TransactionFormProps) {
    const { customer } = useCustomerAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateTransactionForm>({
        role: 'BUYER',
        partner_username: initialPartnerUsername || '',
        amount: 0,
        description: '',
        duration_hours: 24,
    });
    const formRef = useRef<HTMLFormElement>(null);

    // Update partner username if initialPartnerUsername changes
    useEffect(() => {
        if (initialPartnerUsername) {
            setFormData(prev => ({
                ...prev,
                partner_username: initialPartnerUsername
            }));
        }
    }, [initialPartnerUsername]);

    const durationOptions = [
        { value: 1, label: '1 giờ', days: 0 },
        { value: 6, label: '6 giờ', days: 0 },
        { value: 12, label: '12 giờ', days: 0 },
        { value: 24, label: '1 ngày', days: 1 },
        { value: 72, label: '3 ngày', days: 3 },
        { value: 168, label: '7 ngày', days: 7 },
    ];

    const selectedDuration = durationOptions.find((opt) => opt.value === formData.duration_hours);
    const fee = formData.amount > 0 ? calculateTransactionFee(formData.amount, selectedDuration?.days || 0) : 0;
    const pointsReward = formData.amount > 0 ? calculatePointsReward(formData.amount) : 0;
    const totalRequired = formData.amount + fee;

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (formData.role === 'BUYER' && customer && totalRequired > (customer.balance?.balance || 0)) {
            alert('Số dư không đủ để thực hiện giao dịch này');
            return;
        }

        setLoading(true);

        try {
            router.post('/customer/transactions', formData as unknown as Record<string, string | number>, {
                onSuccess: () => {
                    if (onSuccess) {
                        onSuccess();
                    } else {
                        router.visit('/customer/transactions');
                    }
                },
                onError: () => {
                    setLoading(false);
                },
                onFinish: () => {
                    setLoading(false);
                },
            });
        } catch (error) {
            setLoading(false);
            console.error('Create transaction error:', error);
        }
    };

    const handleInputChange = (field: keyof CreateTransactionForm, value: string | number) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    return (
        <div className="mx-auto max-w-4xl min-w-3xl space-y-6">
            {/* Header */}
            <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                    <ArrowRightLeft className="h-8 w-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Tạo giao dịch trung gian</h1>
                <p className="mt-2 text-gray-600">Tạo giao dịch an toàn với bảo vệ từ hệ thống trung gian</p>
            </div>

            {/* Balance Info */}
            {customer && (
                <Alert>
                    <DollarSign className="h-4 w-4" />
                    <AlertDescription>
                        <div className="flex items-center justify-between">
                            <span>Số dư hiện tại:</span>
                            <span className="font-semibold text-green-600">{formatVND(customer.balance?.balance || 0)}</span>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            {/* Messages */}
            {message && (
                <Alert>
                    <AlertDescription>{message}</AlertDescription>
                </Alert>
            )}

            {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                    <AlertDescription>
                        {Object.values(errors).map((error, index) => (
                            <div key={index}>{error}</div>
                        ))}
                    </AlertDescription>
                </Alert>
            )}

            {/* Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Thông tin giao dịch</CardTitle>
                    <CardDescription>Vui lòng điền đầy đủ thông tin để tạo giao dịch</CardDescription>
                </CardHeader>
                <CardContent>
                    <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Role Selection */}
                            <div className="space-y-2">
                                <Label>Vai trò của bạn *</Label>
                                <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn vai trò" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="BUYER">🛒 Người mua (Tôi sẽ trả tiền)</SelectItem>
                                        <SelectItem value="SELLER">💰 Người bán (Tôi sẽ nhận tiền)</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.role && <p className="text-sm text-red-600">{errors.role}</p>}
                            </div>

                            {/* Partner Username */}
                            <div className="space-y-2">
                                <Label htmlFor="partner_username">
                                    Username đối tác *
                                    <span className="ml-1 text-sm text-gray-500">({formData.role === 'BUYER' ? 'Người bán' : 'Người mua'})</span>
                                </Label>
                                <div className="relative">
                                    <User className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="partner_username"
                                        type="text"
                                        placeholder="Nhập username của đối tác"
                                        value={formData.partner_username}
                                        onChange={(e) => handleInputChange('partner_username', e.target.value)}
                                        className="pl-10"
                                        required
                                    />
                                </div>
                                {errors.partner_username && <p className="text-sm text-red-600">{errors.partner_username}</p>}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {/* Amount */}
                            <div className="space-y-2">
                                <Label htmlFor="amount">Số tiền giao dịch (VNĐ) *</Label>
                                <div className="relative">
                                    <DollarSign className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        id="amount"
                                        type="number"
                                        placeholder="Nhập số tiền"
                                        value={formData.amount || ''}
                                        onChange={(e) => handleInputChange('amount', parseInt(e.target.value) || 0)}
                                        className="pl-10"
                                        min="1000"
                                        required
                                    />
                                </div>
                                {errors.amount && <p className="text-sm text-red-600">{errors.amount}</p>}
                            </div>

                            {/* Duration */}
                            <div className="space-y-2">
                                <Label>Thời gian giao dịch *</Label>
                                <Select
                                    value={formData.duration_hours.toString()}
                                    onValueChange={(value) => handleInputChange('duration_hours', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn thời gian" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {durationOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                <div className="flex w-full items-center justify-between">
                                                    <span>{option.label}</span>
                                                    {option.days > 0 && (
                                                        <Badge variant="outline" className="ml-2">
                                                            +{option.days * 20}% phí
                                                        </Badge>
                                                    )}
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.duration_hours && <p className="text-sm text-red-600">{errors.duration_hours}</p>}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Mô tả giao dịch *</Label>
                            <div className="relative">
                                <FileText className="absolute top-3 left-3 h-4 w-4 text-gray-400" />
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả chi tiết về sản phẩm/dịch vụ giao dịch..."
                                    value={formData.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('description', e.target.value)}
                                    className="min-h-20 pl-10"
                                    required
                                />
                            </div>
                            {errors.description && <p className="text-sm text-red-600">{errors.description}</p>}
                        </div>

                        {/* Fee Calculation */}
                        {formData.amount > 0 && (
                            <Card className="bg-gray-50">
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Calculator className="mr-2 h-5 w-5" />
                                        Chi phí giao dịch
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex justify-between">
                                        <span>Số tiền giao dịch:</span>
                                        <span className="font-medium">{formatVND(formData.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Phí giao dịch:</span>
                                        <span className="font-medium text-orange-600">{formatVND(fee)}</span>
                                    </div>
                                    {formData.role === 'BUYER' && (
                                        <div className="flex justify-between border-t pt-2 text-lg font-bold">
                                            <span>Tổng cần thanh toán:</span>
                                            <span className="text-red-600">{formatVND(totalRequired)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-green-600">
                                        <span>Điểm C thưởng:</span>
                                        <span className="font-medium">+{pointsReward} C</span>
                                    </div>

                                    {formData.role === 'BUYER' && customer && totalRequired > (customer.balance?.balance || 0) && (
                                        <Alert variant="destructive">
                                            <AlertDescription>
                                                ⚠️ Số dư không đủ! Vui lòng nạp thêm {formatVND(totalRequired - (customer.balance?.balance || 0))}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Submit Button */}
                        {renderButtons ? (
                            renderButtons({
                                loading,
                                canSubmit: !(loading || (formData.role === 'BUYER' && customer && totalRequired > (customer.balance?.balance || 0))),
                                onCancel: () => {
                                    if (onSuccess) {
                                        onSuccess();
                                    } else {
                                        router.visit('/customer/transactions');
                                    }
                                },
                                onSubmit: () => {
                                    // Trigger form submit programmatically using ref
                                    if (formRef.current) {
                                        const submitEvent = new Event('submit', { 
                                            cancelable: true, 
                                            bubbles: true 
                                        });
                                        formRef.current.dispatchEvent(submitEvent);
                                    }
                                }
                            })
                        ) : !isInDialog ? (
                            <div className="flex space-x-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    className="flex-1" 
                                    onClick={() => router.visit('/customer/transactions')}
                                >
                                    Hủy
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={
                                        loading ||
                                        (formData.role === 'BUYER' && customer && totalRequired > (customer.balance?.balance || 0)) ||
                                        false
                                    }
                                >
                                    {loading ? 'Đang tạo...' : 'Tạo giao dịch'}
                                </Button>
                            </div>
                        ) : null}
                    </form>
                </CardContent>
            </Card>

            {/* Warning */}
            <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Lưu ý quan trọng:</strong>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
                        <li>Phí giao dịch sẽ được tính từ người mua</li>
                        <li>Tiền sẽ được giữ an toàn cho đến khi giao dịch hoàn tất</li>
                        <li>Cả hai bên phải xác nhận để hoàn tất giao dịch</li>
                        <li>Nếu vượt quá thời gian, giao dịch sẽ tự động hủy</li>
                    </ul>
                </AlertDescription>
            </Alert>
        </div>
    );
}
