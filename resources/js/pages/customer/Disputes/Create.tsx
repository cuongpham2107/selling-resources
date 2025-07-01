import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Upload, X, FileText, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomerLayout from '@/layouts/CustomerLayout';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';

interface Transaction {
    id: number;
    amount: number;
    created_at: string;
    product?: {
        id: number;
        name: string;
    };
    seller?: {
        id: number;
        username: string;
    };
}

interface DisputeReason {
    [key: string]: string;
}

interface CreateDisputePageProps {
    disputableTransactions: Transaction[];
    disputeReasons: DisputeReason;
}

export default function CreateDispute({ disputableTransactions, disputeReasons }: CreateDisputePageProps) {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
    const { data, setData, post, processing, errors } = useForm({
        transaction_id: '',
        reason: '',
        description: '',
        evidence_files: [] as File[]
    });

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (selectedFiles.length + files.length > 5) {
            alert('Bạn chỉ có thể tải lên tối đa 5 tệp');
            return;
        }
        
        const newFiles = [...selectedFiles, ...files];
        setSelectedFiles(newFiles);
        setData('evidence_files', newFiles);
    };

    const removeFile = (index: number) => {
        const newFiles = selectedFiles.filter((_, i) => i !== index);
        setSelectedFiles(newFiles);
        setData('evidence_files', newFiles);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/disputes');
    };

    const selectedTransaction = disputableTransactions.find(t => t.id.toString() === data.transaction_id);

    return (
        <CustomerLayout>
            <Head title="Tạo tranh chấp mới" />
            
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/customer/disputes">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Tạo tranh chấp mới</h1>
                        <p className="text-gray-600">Tạo tranh chấp cho giao dịch không thành công</p>
                    </div>
                </div>

                {/* Warning Alert */}
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        Bạn chỉ có thể tạo tranh chấp cho các giao dịch hoàn thành trong vòng 30 ngày qua. 
                        Hãy đảm bảo cung cấp đầy đủ bằng chứng để hỗ trợ quá trình xử lý.
                    </AlertDescription>
                </Alert>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Left Column - Form */}
                        <div className="space-y-6">
                            {/* Transaction Selection */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Chọn giao dịch</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="transaction_id">Giao dịch có thể tranh chấp</Label>
                                        <Select 
                                            value={data.transaction_id} 
                                            onValueChange={(value) => setData('transaction_id', value)}
                                        >
                                            <SelectTrigger className={errors.transaction_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Chọn giao dịch cần tranh chấp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {disputableTransactions.length === 0 ? (
                                                    <div className="p-4 text-center text-gray-500">
                                                        Không có giao dịch nào có thể tranh chấp
                                                    </div>
                                                ) : (
                                                    disputableTransactions.map((transaction) => (
                                                        <SelectItem key={transaction.id} value={transaction.id.toString()}>
                                                            <div className="flex items-center justify-between w-full">
                                                                <span>#{transaction.id} - {transaction.product?.name || 'N/A'}</span>
                                                                <span className="text-sm text-gray-500 ml-4">
                                                                    {formatVND(transaction.amount)}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))
                                                )}
                                            </SelectContent>
                                        </Select>
                                        {errors.transaction_id && (
                                            <p className="text-sm text-red-600 mt-1">{errors.transaction_id}</p>
                                        )}
                                    </div>

                                    {/* Transaction Details */}
                                    {selectedTransaction && (
                                        <div className="p-4 bg-gray-50 rounded-lg">
                                            <h4 className="font-medium mb-2">Chi tiết giao dịch</h4>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="font-medium">Sản phẩm:</span> {selectedTransaction.product?.name}</p>
                                                <p><span className="font-medium">Người bán:</span> {selectedTransaction.seller?.username}</p>
                                                <p><span className="font-medium">Số tiền:</span> {formatVND(selectedTransaction.amount)}</p>
                                                <p><span className="font-medium">Ngày giao dịch:</span> {formatDate(selectedTransaction.created_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Dispute Reason */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>Lý do tranh chấp</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="reason">Chọn lý do</Label>
                                        <Select 
                                            value={data.reason} 
                                            onValueChange={(value) => setData('reason', value)}
                                        >
                                            <SelectTrigger className={errors.reason ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Chọn lý do tranh chấp" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(disputeReasons).map(([key, label]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.reason && (
                                            <p className="text-sm text-red-600 mt-1">{errors.reason}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Mô tả chi tiết</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Mô tả chi tiết về vấn đề bạn gặp phải..."
                                            rows={6}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        {errors.description && (
                                            <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                                        )}
                                        <p className="text-sm text-gray-500 mt-1">
                                            Tối đa 2000 ký tự. Hiện tại: {data.description.length}/2000
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Right Column - Evidence Upload */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Bằng chứng (Tùy chọn)</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="evidence">Tải lên bằng chứng</Label>
                                        <div className="mt-2">
                                            <div className="flex items-center justify-center w-full">
                                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                        <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                                        <p className="mb-2 text-sm text-gray-500">
                                                            <span className="font-semibold">Nhấp để tải lên</span> hoặc kéo thả
                                                        </p>
                                                        <p className="text-xs text-gray-500">PNG, JPG, PDF (Tối đa 10MB mỗi tệp)</p>
                                                    </div>
                                                    <input
                                                        type="file"
                                                        multiple
                                                        accept="image/*,.pdf,.doc,.docx"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                        
                                        {errors.evidence_files && (
                                            <p className="text-sm text-red-600 mt-1">{errors.evidence_files}</p>
                                        )}
                                        
                                        <p className="text-sm text-gray-500 mt-2">
                                            Tối đa 5 tệp, mỗi tệp không quá 10MB
                                        </p>
                                    </div>

                                    {/* Selected Files */}
                                    {selectedFiles.length > 0 && (
                                        <div className="space-y-2">
                                            <Label>Tệp đã chọn ({selectedFiles.length}/5)</Label>
                                            {selectedFiles.map((file, index) => (
                                                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-2">
                                                        <FileText className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm font-medium">{file.name}</span>
                                                        <span className="text-xs text-gray-500">
                                                            ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                                        </span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => removeFile(index)}
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Evidence Guidelines */}
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium text-blue-900 mb-2">Bằng chứng hữu ích:</h4>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Ảnh chụp màn hình sản phẩm</li>
                                            <li>• Tin nhắn với người bán</li>
                                            <li>• Ảnh sản phẩm nhận được (nếu có)</li>
                                            <li>• Bằng chứng thanh toán</li>
                                            <li>• Tài liệu liên quan khác</li>
                                        </ul>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <Link href="/customer/disputes">
                            <Button type="button" variant="outline">
                                Hủy
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={processing || !data.transaction_id || !data.reason || !data.description}
                        >
                            {processing ? 'Đang tạo...' : 'Tạo tranh chấp'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}
