import React from 'react';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GeneralChatMessage {
    id: number;
    message: string;
    created_at: string;
    sender: {
        id: number;
        username: string;
    };
}

interface ReportDialogProps {
    isOpen: boolean;
    onClose: () => void;
    message: GeneralChatMessage;
    onSuccess?: () => void;
}

const reportReasons = {
    'spam': 'Spam hoặc quảng cáo',
    'inappropriate': 'Nội dung không phù hợp',
    'harassment': 'Quấy rối hoặc bắt nạt',
    'fraud': 'Lừa đảo hoặc gian lận',
    'hate_speech': 'Ngôn từ thù địch',
    'violence': 'Bạo lực hoặc đe dọa',
    'personal_info': 'Chia sẻ thông tin cá nhân',
    'other': 'Lý do khác',
};

export default function ReportDialog({ isOpen, onClose, message, onSuccess }: ReportDialogProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        general_chat_id: message.id,
        reason: '',
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.reports.store'), {
            onSuccess: () => {
                reset();
                onClose();
                if (onSuccess) {
                    onSuccess();
                }
            },
        });
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Flag className="w-5 h-5 text-red-600" />
                        Báo cáo tin nhắn vi phạm
                    </DialogTitle>
                    <DialogDescription>
                        Báo cáo tin nhắn có nội dung không phù hợp từ {message.sender.username}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Warning Alert */}
                    <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                            <strong>Lưu ý:</strong> Chỉ báo cáo những tin nhắn thực sự vi phạm quy tắc. 
                            Báo cáo sai lệch có thể bị hạn chế tài khoản.
                        </AlertDescription>
                    </Alert>

                    {/* Message Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-2">
                            <span className="font-medium text-gray-900">
                                {message.sender.username}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTime(message.created_at)}
                            </span>
                        </div>
                        <p className="text-gray-700 break-words text-sm">
                            {message.message}
                        </p>
                    </div>

                    {/* Report Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Reason Selection */}
                        <div className="space-y-2">
                            <Label htmlFor="reason">Lý do báo cáo *</Label>
                            <Select value={data.reason} onValueChange={(value) => setData('reason', value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn lý do báo cáo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(reportReasons).map(([key, value]) => (
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
                                rows={3}
                                maxLength={500}
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>Tối đa 500 ký tự</span>
                                <span>{data.description.length}/500</span>
                            </div>
                            {errors.description && (
                                <p className="text-sm text-red-600">{errors.description}</p>
                            )}
                        </div>

                        {/* Guidelines */}
                        <div className="bg-blue-50 p-3 rounded-lg text-xs">
                            <p className="font-medium text-blue-800 mb-1">Hướng dẫn báo cáo:</p>
                            <div className="grid grid-cols-2 gap-2 text-blue-700">
                                <div>
                                    <span className="text-green-600">✓</span> Spam, quảng cáo
                                </div>
                                <div>
                                    <span className="text-green-600">✓</span> Ngôn từ thù địch
                                </div>
                                <div>
                                    <span className="text-green-600">✓</span> Lừa đảo, gian lận
                                </div>
                                <div>
                                    <span className="text-green-600">✓</span> Nội dung bạo lực
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline" onClick={handleClose}>
                            Hủy
                        </Button>
                    </DialogClose>
                    <Button
                        onClick={handleSubmit}
                        disabled={processing || !data.reason}
                    >
                        {processing ? 'Đang gửi...' : 'Gửi báo cáo'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
