import ReportDialog from '@/components/Customer/ReportDialog';
import TransactionForm from '@/components/Customer/Transactions/Form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '@/components/ui/context-menu';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Customer } from '@/types';
import { router } from '@inertiajs/react';
import { AlertCircle, BadgeDollarSign, DollarSign, Flag, Info, MessageSquare, Package, Send, Users, Eye} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GeneralChatMessage {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender: {
        id: number;
        username: string;
    };
    attached_product?: {
        id: number;
        name: string;
        price: number;
    };
}

interface GeneralChatPageProps {
    canSendMessage: boolean;
    maxMessages: number;
    usedMessages: number;
    chatMessages: {
        data: GeneralChatMessage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    currentUser: Customer;
    lastChatTime?: string;
    userProducts: Array<{
        id: number;
        name: string;
        price: number;
    }>;
}

export default function GeneralChat({
    canSendMessage,
    maxMessages,
    usedMessages,
    chatMessages,
    currentUser,
    lastChatTime,
    userProducts,
}: GeneralChatPageProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState<string>('none');
    const [isTransactionDialogOpen, setIsTransactionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<{ id: number; username: string } | null>(null);
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [selectedMessageForReport, setSelectedMessageForReport] = useState<GeneralChatMessage | null>(null);
    const [reportedMessages, setReportedMessages] = useState<Set<number>>(new Set());
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    // Reset selected user when transaction dialog is closed
    useEffect(() => {
        if (!isTransactionDialogOpen) {
            // Delay reset to avoid state conflicts
            const timer = setTimeout(() => {
                setSelectedUser(null);
            }, 150);
            return () => clearTimeout(timer);
        }
    }, [isTransactionDialogOpen]);

    // Force body scroll restore when dialog closes
    useEffect(() => {
        if (!isTransactionDialogOpen) {
            // Ensure body is scrollable and no overlay remnants
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';

            // Remove any aria-hidden that might be stuck
            const elementsWithAriaHidden = document.querySelectorAll('[aria-hidden="true"]');
            elementsWithAriaHidden.forEach((el) => {
                if (el !== document.querySelector('[data-radix-portal]')) {
                    el.removeAttribute('aria-hidden');
                }
            });
        }
    }, [isTransactionDialogOpen]);

    const handleCreateTransaction = (senderId: number, senderUsername: string) => {
        // Ensure any existing dialog is closed first
        if (isTransactionDialogOpen) {
            setIsTransactionDialogOpen(false);
            setTimeout(() => {
                setSelectedUser({ id: senderId, username: senderUsername });
                setIsTransactionDialogOpen(true);
            }, 200);
        } else {
            setSelectedUser({ id: senderId, username: senderUsername });
            setIsTransactionDialogOpen(true);
        }
    };

    const handleCloseTransactionDialog = () => {
        // Immediately close dialog
        setIsTransactionDialogOpen(false);

        // Force cleanup of any modal state
        setTimeout(() => {
            setSelectedUser(null);

            // Additional cleanup for any stuck modal states
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';

            // Remove any data attributes that might be causing issues
            document.body.removeAttribute('data-scroll-locked');
        }, 100);
    };

    const handleReportMessage = (message: GeneralChatMessage) => {
        if (reportedMessages.has(message.id)) {
            return; // Đã báo cáo rồi, không làm gì
        }
        setSelectedMessageForReport(message);
        setIsReportDialogOpen(true);
    };

    const handleReportSuccess = () => {
        if (selectedMessageForReport) {
            // Thêm message ID vào danh sách đã báo cáo
            setReportedMessages((prev) => new Set(prev).add(selectedMessageForReport.id));
        }
        setIsReportDialogOpen(false);
        setSelectedMessageForReport(null);
    };

    const handleCloseReportDialog = () => {
        setIsReportDialogOpen(false);
        setSelectedMessageForReport(null);
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading || !canSendMessage) return;

        setLoading(true);
        try {
            await router.post('/customer/chat/general', {
                message: message.trim(),
                attached_product_id: selectedProductId && selectedProductId !== 'none' ? selectedProductId : null,
            });

            // Reset form
            setMessage('');
            setSelectedProductId('none');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewProduct = (productId: number) => {
        router.get(`/customer/marketplace/product/${productId}`);
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
        <CustomerLayout>
            <div className="mx-auto max-w-6xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <div>
                            <h1 className="flex items-center text-2xl font-bold text-gray-900">
                                <Users className="mr-2 h-6 w-6 text-green-600" />
                                Chat Tổng
                            </h1>
                            <p className="text-gray-600">Phòng chat công khai cho tất cả người dùng</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="mb-1 flex items-center justify-end gap-2">
                                <Badge variant="secondary" className="text-sm">
                                    {usedMessages}/{maxMessages} tin nhắn đã dùng hôm nay
                                </Badge>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-6 w-6 p-1">
                                            <Info className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-w-md">
                                        <DialogHeader>
                                            <DialogTitle className="flex items-center gap-2">
                                                <AlertCircle className="h-5 w-5 text-orange-600" />
                                                Quy tắc phòng chat
                                            </DialogTitle>
                                            <DialogDescription>Tìm hiểu các quy tắc và hướng dẫn sử dụng phòng chat tổng</DialogDescription>
                                        </DialogHeader>
                                        <div className="space-y-4 text-sm">
                                            <div className="space-y-2">
                                                <p className="font-medium text-green-600">✓ Được khuyến khích:</p>
                                                <ul className="space-y-1 pl-4 text-gray-600">
                                                    <li>• Tôn trọng người dùng khác</li>
                                                    <li>• Thảo luận về sản phẩm</li>
                                                    <li>• Chia sẻ kinh nghiệm mua sắm</li>
                                                    <li>• Hỏi đáp tích cực</li>
                                                </ul>
                                            </div>
                                            <div className="space-y-2">
                                                <p className="font-medium text-red-600">✗ Không được phép:</p>
                                                <ul className="space-y-1 pl-4 text-gray-600">
                                                    <li>• Spam hoặc quảng cáo</li>
                                                    <li>• Ngôn ngữ thiếu văn hóa</li>
                                                    <li>• Chia sẻ thông tin cá nhân</li>
                                                    <li>• Gian lận hoặc lừa đảo</li>
                                                </ul>
                                            </div>
                                            <div className="border-t pt-2">
                                                <p className="text-xs text-gray-500">Vi phạm quy tắc có thể dẫn đến việc tạm khóa tài khoản</p>
                                            </div>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <p className="text-xs text-gray-500">{chatMessages.total} tin nhắn trong phòng</p>
                        </div>
                    </div>
                </div>

                {/* Message Limit Warning */}
                {!canSendMessage && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {usedMessages >= maxMessages
                                ? `Bạn đã đạt giới hạn ${maxMessages} tin nhắn mỗi ngày. Hãy thử lại vào ngày mai.`
                                : lastChatTime
                                  ? 'Bạn cần chờ 1 giờ từ tin nhắn cuối cùng để gửi tin nhắn mới.'
                                  : 'Bạn không thể gửi tin nhắn lúc này.'}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Chat Room */}
                <Card className="flex h-[800px] flex-col">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <MessageSquare className="mr-2 h-5 w-5 text-blue-600" />
                                Phòng Chat Công Khai
                            </div>
                            <Badge variant="outline" className="bg-green-600 text-white">
                                Trực tuyến
                            </Badge>
                        </CardTitle>
                    </CardHeader>

                    {/* Messages Area */}
                    <CardContent className="flex-1 space-y-4 overflow-y-auto p-4">
                        {chatMessages.data.length === 0 ? (
                            <div className="py-8 text-center text-gray-500">
                                <MessageSquare className="mx-auto mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
                                <p className="text-sm">Hãy là người đầu tiên gửi tin nhắn!</p>
                            </div>
                        ) : (
                            chatMessages.data
                                .slice()
                                .reverse()
                                .map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}>
                                        {msg.sender.id === currentUser.id ? (
                                            // Own message - no context menu
                                            <div className="max-w-xs rounded-lg bg-gray-600 px-4 py-3 text-white shadow-md transition-colors hover:bg-gray-700 lg:max-w-md">
                                                <p className="text-sm font-bold">{msg.message}</p>
                                                {msg.attached_product && (
                                                    <div className="mt-2 rounded-md border border-blue-400 bg-blue-500 p-2.5 shadow-sm">
                                                        <div className="mb-1 flex items-center text-xs text-white">
                                                            <Package className="mr-1.5 h-3.5 w-3.5" />
                                                            <span className="font-medium">{msg.attached_product.name}</span>
                                                        </div>
                                                        <div className="flex items-center text-xs text-blue-100">
                                                            <BadgeDollarSign className="mr-1 h-3.5 w-3.5" />
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                                msg.attached_product.price,
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="mt-1.5 flex justify-end">
                                                    <p className="text-xs text-blue-100">
                                                        {new Date(msg.created_at).toDateString() === new Date().toDateString()
                                                            ? new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                                                                  hour: '2-digit',
                                                                  minute: '2-digit',
                                                              })
                                                            : formatTime(msg.created_at)}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            // Other user's message - with context menu
                                            <ContextMenu>
                                                <ContextMenuTrigger>
                                                    <div className="max-w-xs cursor-pointer rounded-lg bg-gray-100 px-4 py-2 text-gray-900 transition-all hover:bg-gray-200 hover:shadow-md lg:max-w-md">
                                                        <p className="mb-1 text-xs font-bold text-gray-900">{msg.sender.username}</p>
                                                        <p className="text-sm">{msg.message}</p>
                                                        {msg.attached_product && (
                                                            <div className="mt-2 rounded border border-gray-200 bg-gray-50 p-2">
                                                                <div className="flex items-center text-xs text-gray-700">
                                                                    <Package className="mr-1 h-3 w-3" />
                                                                    <span className="font-medium">{msg.attached_product.name}</span>
                                                                </div>
                                                                <div className="text-xs text-gray-600">
                                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                                        msg.attached_product.price,
                                                                    )}
                                                                </div>
                                                            </div>
                                                        )}
                                                        <p className="mt-1 text-xs opacity-75">
                                                            {new Date(msg.created_at).toDateString() === new Date().toDateString()
                                                                ? new Date(msg.created_at).toLocaleTimeString('vi-VN', {
                                                                      hour: '2-digit',
                                                                      minute: '2-digit',
                                                                  })
                                                                : formatTime(msg.created_at)}
                                                        </p>
                                                    </div>
                                                </ContextMenuTrigger>
                                                <ContextMenuContent className="w-64">
                                                    <div className="px-2 py-1.5 text-sm font-semibold text-gray-900">
                                                        Tương tác với {msg.sender.username}
                                                    </div>
                                                    <ContextMenuSeparator />
                                                    {
                                                        msg.attached_product && (
                                                            <ContextMenuItem onClick={() => msg.attached_product && handleViewProduct(msg.attached_product.id)}>
                                                                <Eye className="mr-2 h-4 w-4 text-blue-600" />
                                                                <div>
                                                                    <div className="font-medium">Xem chi tiết sản phẩm</div>
                                                                    <div className="text-xs text-gray-500">
                                                                        {msg.attached_product
                                                                            ? `Sản phẩm: ${msg.attached_product.name}`
                                                                            : 'Tin nhắn không có sản phẩm đính kèm'}
                                                                    </div>
                                                                </div>
                                                            </ContextMenuItem>
                                                        )
                                                    }
                                                    
                                                    <ContextMenuItem
                                                        onClick={() => handleCreateTransaction(msg.sender.id, msg.sender.username)}
                                                        className="flex items-center space-x-2"
                                                    >
                                                        <DollarSign className="h-4 w-4 text-green-600" />
                                                        <div>
                                                            <div className="font-medium">Tạo giao dịch</div>
                                                            <div className="text-xs text-gray-500">Khởi tạo giao dịch trung gian</div>
                                                        </div>
                                                    </ContextMenuItem>
                                                    <ContextMenuItem
                                                        onClick={() => handleReportMessage(msg)}
                                                        className="flex items-center space-x-2"
                                                        disabled={reportedMessages.has(msg.id)}
                                                    >
                                                        <Flag className="h-4 w-4 text-red-600" />
                                                        <div>
                                                            <div className="font-medium">
                                                                {reportedMessages.has(msg.id) ? 'Đã báo cáo' : 'Báo cáo'}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {reportedMessages.has(msg.id)
                                                                    ? 'Tin nhắn đã được báo cáo'
                                                                    : 'Báo cáo tin nhắn vi phạm'}
                                                            </div>
                                                        </div>
                                                    </ContextMenuItem>
                                                </ContextMenuContent>
                                            </ContextMenu>
                                        )}
                                    </div>
                                ))
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="space-y-3">
                            {/* Product Selector */}
                            {userProducts.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Đính kèm sản phẩm (tùy chọn)</label>
                                    <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Chọn sản phẩm để đính kèm..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">Không đính kèm sản phẩm</SelectItem>
                                            {userProducts.map((product) => (
                                                <SelectItem key={product.id} value={product.id.toString()}>
                                                    <div className="flex w-full items-center justify-between">
                                                        <span className="font-medium">{product.name}</span>
                                                        <span className="ml-2 text-sm text-gray-500">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND',
                                                            }).format(product.price)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Message Input */}
                            <div className="relative">
                                <Textarea
                                    placeholder="Nhập tin nhắn của bạn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!canSendMessage || loading}
                                    className="resize-none pr-12"
                                    maxLength={1000}
                                    rows={2}
                                />
                                <Button
                                    type="submit"
                                    disabled={!canSendMessage || loading || !message.trim()}
                                    className="absolute right-2 bottom-2 h-8 w-8 p-0"
                                    size="sm"
                                >
                                    {loading ? (
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <Send className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>

                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{message.length}/1000 ký tự</span>
                                <span>Chuột phải trên tin nhắn để xem menu tương tác</span>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Transaction Dialog */}
                {/* Use conditional rendering to force unmount when closed */}
                {isTransactionDialogOpen && selectedUser && (
                    <Dialog
                        open={isTransactionDialogOpen}
                        onOpenChange={(open) => {
                            if (!open) {
                                handleCloseTransactionDialog();
                            }
                        }}
                        modal={true}
                    >
                        <DialogContent
                            className="max-h-[90vh] max-w-xl overflow-y-auto md:max-w-5xl"
                            onPointerDownOutside={() => {
                                handleCloseTransactionDialog();
                            }}
                            onEscapeKeyDown={() => {
                                handleCloseTransactionDialog();
                            }}
                        >
                            <DialogHeader>
                                <DialogTitle>Tạo giao dịch trung gian với {selectedUser.username}</DialogTitle>
                                <DialogDescription>
                                    Điền thông tin giao dịch để bắt đầu một giao dịch an toàn với {selectedUser.username}
                                </DialogDescription>
                            </DialogHeader>
                            <TransactionForm
                                key={`transaction-${selectedUser.id}-${Date.now()}`}
                                initialPartnerUsername={selectedUser.username}
                                onSuccess={handleCloseTransactionDialog}
                                isInDialog={true}
                                renderButtons={({ loading, canSubmit, onCancel, onSubmit }) => (
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button
                                                variant="outline"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    onCancel();
                                                }}
                                            >
                                                Hủy
                                            </Button>
                                        </DialogClose>
                                        <Button onClick={onSubmit} disabled={!canSubmit}>
                                            {loading ? 'Đang tạo...' : 'Tạo giao dịch'}
                                        </Button>
                                    </DialogFooter>
                                )}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Report Dialog */}
            {selectedMessageForReport && (
                <ReportDialog
                    isOpen={isReportDialogOpen}
                    onClose={handleCloseReportDialog}
                    message={selectedMessageForReport}
                    onSuccess={handleReportSuccess}
                />
            )}
        </CustomerLayout>
    );
}
