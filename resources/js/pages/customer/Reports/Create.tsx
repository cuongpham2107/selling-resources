import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, Flag, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomerLayout from '@/layouts/CustomerLayout';

interface GeneralChat {
    id: number;
    message: string;
    created_at: string;
    sender: {
        id: number;
        username: string;
    };
}

interface CreateReportPageProps {
    generalChat?: GeneralChat;
    reasons: Record<string, string>;
}

export default function CreateReport({ generalChat, reasons }: CreateReportPageProps) {
    const { data, setData, post, processing, errors } = useForm({
        general_chat_id: generalChat?.id || '',
        reason: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.reports.store'));
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    return (
        <CustomerLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center space-x-4">
                    <Link href="/customer/chat/general">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại Chat
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Flag className="w-6 h-6 mr-2 text-red-600" />
                            Báo cáo tin nhắn vi phạm
                        </h1>
                        <p className="text-gray-600">Báo cáo tin nhắn có nội dung không phù hợp</p>
                    </div>
                </div>

                {/* Warning Alert */}
                <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Lưu ý:</strong> Hãy chỉ báo cáo những tin nhắn thực sự vi phạm quy tắc cộng đồng. 
                        Việc báo cáo sai lệch có thể dẫn đến hạn chế tài khoản của bạn.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Message Preview */}
                    {generalChat && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center text-lg">
                                    <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                    Tin nhắn bị báo cáo
                                </CardTitle>
                                <CardDescription>
                                    Xem lại nội dung tin nhắn bạn muốn báo cáo
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="bg-gray-50 p-4 rounded-lg border">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-medium text-gray-900">
                                            {generalChat.sender.username}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatTime(generalChat.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-gray-700 break-words">
                                        {generalChat.message}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Report Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin báo cáo</CardTitle>
                            <CardDescription>
                                Vui lòng cung cấp thông tin chi tiết về vi phạm
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Reason Selection */}
                                <div className="space-y-2">
                                    <Label htmlFor="reason">Lý do báo cáo *</Label>
                                    <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn lý do báo cáo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(reasons).map(([key, value]) => (
                                                <SelectItem key={key} value={key}>
                                                    {value}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.reason && (
                                        <p className="text-sm text-red-600">{errors.reason}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Mô tả chi tiết (tùy chọn)</Label>
                                    <Textarea
                                        id="description"
                                        placeholder="Mô tả thêm về vi phạm này..."
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        className="resize-none"
                                        rows={4}
                                        maxLength={1000}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Tối đa 1000 ký tự</span>
                                        <span>{data.description.length}/1000</span>
                                    </div>
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => window.history.back()}
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1"
                                        disabled={processing || !data.reason}
                                    >
                                        {processing ? 'Đang gửi...' : 'Gửi báo cáo'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>

                {/* Report Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Hướng dẫn báo cáo</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div>
                                <h4 className="font-medium text-green-600 mb-2">✓ Nên báo cáo khi:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Spam hoặc quảng cáo không liên quan</li>
                                    <li>• Ngôn từ thù địch, xúc phạm</li>
                                    <li>• Nội dung bạo lực, đe dọa</li>
                                    <li>• Lừa đảo hoặc gian lận</li>
                                    <li>• Chia sẻ thông tin cá nhân</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-red-600 mb-2">✗ Không nên báo cáo:</h4>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Ý kiến khác quan điểm</li>
                                    <li>• Tranh luận bình thường</li>
                                    <li>• Tin nhắn không vi phạm quy tắc</li>
                                    <li>• Báo cáo trả đũa cá nhân</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
