import React, { useState, useEffect, useRef } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Send, MessageSquare, ShoppingBag, AlertCircle, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomerLayout from '@/layouts/CustomerLayout';
import type { StoreProduct, Customer } from '@/types';

interface GeneralChatMessage {
    id: number;
    sender_id: number;
    message: string;
    attached_product_id?: number;
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
    remainingMessages: number;
    chatMessages: {
        data: GeneralChatMessage[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    availableProducts: StoreProduct[];
    currentUser: Customer;
}

export default function GeneralChat({ 
    canSendMessage, 
    remainingMessages, 
    chatMessages, 
    availableProducts, 
    currentUser 
}: GeneralChatPageProps) {
    const [message, setMessage] = useState('');
    const [attachedProductId, setAttachedProductId] = useState<string>('none');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [chatMessages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || loading || !canSendMessage) return;

        setLoading(true);
        try {
            await router.post('/customer/chat/general', {
                message: message.trim(),
                attached_product_id: attachedProductId === 'none' || !attachedProductId ? null : attachedProductId,
            });
            
            // Reset form
            setMessage('');
            setAttachedProductId('none');
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setLoading(false);
        }
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
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/chat">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Users className="w-6 h-6 mr-2 text-green-600" />
                                Chat Tổng
                            </h1>
                            <p className="text-gray-600">Phòng chat công khai cho tất cả người dùng</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <Badge variant="secondary" className="text-sm mb-1">
                            {remainingMessages} tin nhắn còn lại hôm nay
                        </Badge>
                        <p className="text-xs text-gray-500">
                            {chatMessages.total} tin nhắn trong phòng
                        </p>
                    </div>
                </div>

                {/* Message Limit Warning */}
                {!canSendMessage && (
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Bạn đã đạt giới hạn 50 tin nhắn mỗi ngày. Hãy thử lại vào ngày mai.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Chat Room */}
                <Card className="flex flex-col h-[600px]">
                    <CardHeader className="border-b">
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                <MessageSquare className="w-5 h-5 mr-2 text-blue-600" />
                                Phòng Chat Công Khai
                            </div>
                            <Badge variant="outline">
                                Trực tuyến
                            </Badge>
                        </CardTitle>
                    </CardHeader>
                    
                    {/* Messages Area */}
                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                        {chatMessages.data.length === 0 ? (
                            <div className="text-center text-gray-500 py-8">
                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                <p className="text-lg font-medium">Chưa có tin nhắn nào</p>
                                <p className="text-sm">Hãy là người đầu tiên gửi tin nhắn!</p>
                            </div>
                        ) : (
                            chatMessages.data.slice().reverse().map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender.id === currentUser.id ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                        msg.sender.id === currentUser.id 
                                            ? 'bg-blue-600 text-white' 
                                            : 'bg-gray-100 text-gray-900'
                                    }`}>
                                        {msg.sender.id !== currentUser.id && (
                                            <p className="text-xs font-medium mb-1 text-gray-600">
                                                {msg.sender.username}
                                            </p>
                                        )}
                                        <p className="text-sm">{msg.message}</p>
                                        {msg.attached_product && (
                                            <div className="mt-2 p-2 bg-black/10 rounded text-xs">
                                                <div className="flex items-center space-x-1">
                                                    <ShoppingBag className="w-3 h-3" />
                                                    <span className="font-medium">{msg.attached_product.name}</span>
                                                </div>
                                                <p className="text-xs opacity-75">
                                                    {msg.attached_product.price.toLocaleString()} VNĐ
                                                </p>
                                            </div>
                                        )}
                                        <p className="text-xs opacity-75 mt-1">
                                            {formatTime(msg.created_at)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </CardContent>

                    {/* Message Input */}
                    <div className="border-t p-4">
                        <form onSubmit={handleSendMessage} className="space-y-3">
                            {/* Product Selection */}
                            <div>
                                <Label htmlFor="product" className="text-sm">Sản phẩm đính kèm (tùy chọn)</Label>
                                <Select value={attachedProductId} onValueChange={setAttachedProductId}>
                                    <SelectTrigger className="mt-1">
                                        <SelectValue placeholder="Chọn sản phẩm (tùy chọn)" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Không đính kèm sản phẩm</SelectItem>
                                        {availableProducts.map((product) => (
                                            <SelectItem key={product.id} value={product.id.toString()}>
                                                <div className="flex items-center space-x-2">
                                                    <ShoppingBag className="w-4 h-4" />
                                                    <span>{product.name}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {product.price ? `${product.price.toLocaleString()} VNĐ` : 'N/A'}
                                                    </Badge>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Message Input */}
                            <div className="flex space-x-2">
                                <Textarea
                                    placeholder="Nhập tin nhắn của bạn..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!canSendMessage || loading}
                                    className="flex-1 resize-none"
                                    maxLength={1000}
                                    rows={2}
                                />
                                <Button 
                                    type="submit" 
                                    disabled={!canSendMessage || loading || !message.trim()}
                                    className="px-4"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </Button>
                            </div>
                            
                            <div className="flex justify-between text-xs text-gray-500">
                                <span>{message.length}/1000 ký tự</span>
                                <span>Enter để gửi tin nhắn</span>
                            </div>
                        </form>
                    </div>
                </Card>

                {/* Chat Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center text-lg">
                            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
                            Quy tắc phòng chat
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <p className="font-medium text-green-600">✓ Được khuyến khích:</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Tôn trọng người dùng khác</li>
                                    <li>• Thảo luận về sản phẩm</li>
                                    <li>• Chia sẻ kinh nghiệm mua sắm</li>
                                    <li>• Hỏi đáp tích cực</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <p className="font-medium text-red-600">✗ Không được phép:</p>
                                <ul className="space-y-1 text-gray-600">
                                    <li>• Spam hoặc quảng cáo</li>
                                    <li>• Ngôn ngữ thiếu văn hóa</li>
                                    <li>• Chia sẻ thông tin cá nhân</li>
                                    <li>• Gian lận hoặc lừa đảo</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
