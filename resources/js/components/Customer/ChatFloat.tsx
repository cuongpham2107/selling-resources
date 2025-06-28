import React, { useState } from 'react';
import { MessageSquare, X, Send, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ChatRoom {
    id: string;
    name: string;
    type: 'general' | 'transaction';
    unreadCount: number;
    lastMessage?: string;
    lastMessageTime?: string;
}

export function ChatFloat() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [activeRoom, setActiveRoom] = useState<string | null>(null);
    const [message, setMessage] = useState('');

    // Mock data - thay thế bằng data thực từ API
    const chatRooms: ChatRoom[] = [
        {
            id: 'general',
            name: 'Chat tổng',
            type: 'general',
            unreadCount: 3,
            lastMessage: 'Có ai cần mua acc Instagram không?',
            lastMessageTime: '2 phút trước'
        },
        {
            id: 'transaction-123',
            name: 'Giao dịch #123',
            type: 'transaction',
            unreadCount: 1,
            lastMessage: 'Tôi đã gửi acc rồi nhé',
            lastMessageTime: '5 phút trước'
        }
    ];

    const totalUnread = chatRooms.reduce((sum, room) => sum + room.unreadCount, 0);

    const handleSendMessage = () => {
        if (!message.trim() || !activeRoom) return;
        
        // TODO: Implement send message logic
        console.log('Sending message:', message, 'to room:', activeRoom);
        setMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <>
            {/* Chat Button */}
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg z-50 bg-blue-600 hover:bg-blue-700"
                    size="icon"
                >
                    <MessageSquare className="h-6 w-6" />
                    {totalUnread > 0 && (
                        <Badge 
                            variant="destructive" 
                            className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center p-0 text-xs"
                        >
                            {totalUnread > 99 ? '99+' : totalUnread}
                        </Badge>
                    )}
                </Button>
            )}

            {/* Chat Window */}
            {isOpen && (
                <Card className={cn(
                    "fixed bottom-4 right-4 w-80 shadow-2xl z-50 transition-all duration-200",
                    isMinimized ? "h-14" : "h-96"
                )}>
                    <CardHeader className="flex flex-row items-center justify-between p-3 bg-blue-600 text-white rounded-t-lg">
                        <CardTitle className="text-sm font-medium">
                            {activeRoom ? chatRooms.find(r => r.id === activeRoom)?.name : 'Chat'}
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-blue-700"
                                onClick={() => setIsMinimized(!isMinimized)}
                            >
                                <Minimize2 className="h-3 w-3" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-white hover:bg-blue-700"
                                onClick={() => setIsOpen(false)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </div>
                    </CardHeader>

                    {!isMinimized && (
                        <CardContent className="p-0 flex flex-col h-80">
                            {!activeRoom ? (
                                /* Room List */
                                <div className="flex-1 overflow-y-auto">
                                    {chatRooms.map((room) => (
                                        <div
                                            key={room.id}
                                            className="p-3 border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
                                            onClick={() => setActiveRoom(room.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between">
                                                        <p className="text-sm font-medium text-gray-900 truncate">
                                                            {room.name}
                                                        </p>
                                                        {room.unreadCount > 0 && (
                                                            <Badge variant="destructive" className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                                                                {room.unreadCount}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {room.lastMessage && (
                                                        <p className="text-xs text-gray-500 truncate mt-1">
                                                            {room.lastMessage}
                                                        </p>
                                                    )}
                                                    {room.lastMessageTime && (
                                                        <p className="text-xs text-gray-400 mt-1">
                                                            {room.lastMessageTime}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Chat Messages */
                                <>
                                    <div className="flex items-center p-2 border-b border-gray-200 bg-gray-50">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setActiveRoom(null)}
                                            className="text-gray-600 hover:text-gray-900"
                                        >
                                            ← Quay lại
                                        </Button>
                                    </div>
                                    
                                    <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                        {/* Mock messages */}
                                        <div className="flex justify-start">
                                            <div className="max-w-xs bg-gray-100 rounded-lg p-2">
                                                <p className="text-sm">Xin chào! Có ai cần mua acc Instagram không?</p>
                                                <p className="text-xs text-gray-500 mt-1">2 phút trước</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-end">
                                            <div className="max-w-xs bg-blue-600 text-white rounded-lg p-2">
                                                <p className="text-sm">Cho mình xem giá với nhé!</p>
                                                <p className="text-xs text-blue-200 mt-1">1 phút trước</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Input */}
                                    <div className="p-3 border-t border-gray-200">
                                        <div className="flex space-x-2">
                                            <Input
                                                placeholder="Nhập tin nhắn..."
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                className="flex-1"
                                            />
                                            <Button 
                                                size="icon" 
                                                onClick={handleSendMessage}
                                                disabled={!message.trim()}
                                            >
                                                <Send className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    )}
                </Card>
            )}
        </>
    );
}
