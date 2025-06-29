import React, { useState, useRef } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { Customer, IntermediateTransaction, TransactionChat } from '@/types';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
    ArrowLeft, 
    MessageSquare, 
    Send, 
    User, 
    Calendar,
    AlertCircle,
    Package,
    ImageIcon,
    FileIcon,
    X,
    Paperclip,
    PhoneCall,
    Mail
} from 'lucide-react';
import { formatVND } from '@/lib/currency';
import { getStatusIcon } from '@/components/status-icon';
import { formatDateTime } from '@/lib/date';
import { formatFileSize, getStatusLabel } from '@/lib/utils';

interface TransactionShowProps {
    transaction: IntermediateTransaction;
    chatMessages: TransactionChat[];
    otherParticipant: Customer;
    currentUser: Customer;
}

export default function TransactionShow({ 
    transaction, 
    chatMessages, 
    otherParticipant, 
    currentUser 
}: TransactionShowProps) {
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const imageInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);

    const { data, setData, processing, reset } = useForm({
        message: '',
        images: [] as File[],
        files: [] as File[],
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!data.message.trim() && selectedImages.length === 0 && selectedFiles.length === 0) {
            return;
        }

        // Use router.post with FormData for file uploads
        const formData = new FormData();
        formData.append('message', data.message);
        
        // Add images
        selectedImages.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });
        
        // Add files  
        selectedFiles.forEach((file, index) => {
            formData.append(`files[${index}]`, file);
        });

        router.post(`/customer/chat/transaction/intermediate/${transaction.id}`, formData, {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setSelectedImages([]);
                setSelectedFiles([]);
                
                // Clear file inputs
                if (imageInputRef.current) imageInputRef.current.value = '';
                if (fileInputRef.current) fileInputRef.current.value = '';
            },
            onError: (errors) => {
                setError(errors.message || 'Đã xảy ra lỗi khi gửi tin nhắn');
            },
        });
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (selectedImages.length + imageFiles.length > 3) {
            alert('Tối đa 3 hình ảnh cho mỗi tin nhắn');
            return;
        }

        setSelectedImages(prev => [...prev, ...imageFiles]);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        
        if (selectedFiles.length + files.length > 5) {
            alert('Tối đa 5 file cho mỗi tin nhắn');
            return;
        }

        setSelectedFiles(prev => [...prev, ...files]);
    };

    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

  

    return (
        <CustomerLayout>
            <Head title={`Chat giao dịch #${transaction.id}`} />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start space-y-4">
                        <Link href="/customer/chat/transaction">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chat giao dịch #{transaction.id}
                            </h1>
                            <p className="text-gray-600">
                                Trò chuyện với {otherParticipant.username}
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="flex items-center space-x-1">
                        {getStatusIcon(transaction.status)}
                        <span>{getStatusLabel(transaction.status)}</span>
                    </Badge>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Chat Messages */}
                    <div className="lg:col-span-3">
                        <Card className="flex flex-col">
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2" />
                                    Tin nhắn giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col">
                                {/* Messages Area */}
                                <div className="flex-1 mb-4 pr-4 overflow-y-auto max-h-[700px]"
                                     style={{ scrollbarWidth: 'thin' }}>
                                    <div className="space-y-4">
                                        {chatMessages.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500">
                                                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                                <p>Chưa có tin nhắn nào</p>
                                                <p className="text-sm">Hãy bắt đầu cuộc trò chuyện!</p>
                                            </div>
                                        ) : (
                                            chatMessages.map((chat, index) => (
                                                <div
                                                    key={index}
                                                    className={`flex ${
                                                        chat.sender_id === currentUser.id 
                                                            ? 'justify-end' 
                                                            : 'justify-start'
                                                    }`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                                            chat.sender_id === currentUser.id
                                                                ? 'bg-blue-500 text-white'
                                                                : 'bg-gray-100 text-gray-900'
                                                        }`}
                                                    >
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <User className="w-3 h-3" />
                                                            <span className="text-xs font-medium">
                                                                {chat.sender_id === currentUser.id 
                                                                    ? 'Bạn' 
                                                                    : chat.sender?.username || 'Người dùng'}
                                                            </span>
                                                        </div>
                                                        
                                                        {chat.message && (
                                                            <p className="text-sm mb-2">{chat.message}</p>
                                                        )}

                                                        {/* Display Images */}
                                                        {chat.images && chat.images.length > 0 && (
                                                            <div className="grid grid-cols-2 gap-1 mb-2">
                                                                {chat.images.map((image, imgIndex) => (
                                                                    <img
                                                                        key={imgIndex}
                                                                        src={image}
                                                                        alt={`Attachment ${imgIndex + 1}`}
                                                                        className="w-full h-20 object-cover rounded cursor-pointer hover:opacity-80"
                                                                        onClick={() => window.open(image, '_blank')}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}                                        {/* Display Files */}
                                        {chat.files && chat.files.length > 0 && (
                                            <div className="space-y-1 mb-2">
                                                {chat.files.map((file, fileIndex) => (
                                                    <a
                                                        key={fileIndex}
                                                        href={file.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={`flex items-center space-x-2 p-2 rounded text-xs ${
                                                            chat.sender_id === currentUser.id
                                                                ? 'bg-blue-400 hover:bg-blue-300'
                                                                : 'bg-white hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        <FileIcon className="w-3 h-3" />
                                                        <span className="truncate">
                                                            {file.name}
                                                        </span>
                                                        {file.size && (
                                                            <span className="text-xs opacity-75">
                                                                ({formatFileSize(file.size)})
                                                            </span>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        )}

                                                        <p className={`text-xs mt-1 ${
                                                            chat.sender_id === currentUser.id
                                                                ? 'text-blue-100'
                                                                : 'text-gray-500'
                                                        }`}>
                                                            {formatDateTime(chat.created_at)}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Message Input */}
                                {transaction.status !== 'completed' && transaction.status !== 'cancelled' && (
                                    <div className="space-y-3">
                                        {/* Selected Images Preview */}
                                        {selectedImages.length > 0 && (
                                            <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-lg">
                                                {selectedImages.map((image, index) => (
                                                    <div key={index} className="relative">
                                                        <img
                                                            src={URL.createObjectURL(image)}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-16 h-16 object-cover rounded border"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(index)}
                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Selected Files Preview */}
                                        {selectedFiles.length > 0 && (
                                            <div className="space-y-1 p-2 bg-gray-50 rounded-lg">
                                                {selectedFiles.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                                        <div className="flex items-center space-x-2">
                                                            <FileIcon className="w-4 h-4 text-gray-500" />
                                                            <span className="text-sm font-medium truncate max-w-xs">
                                                                {file.name}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({formatFileSize(file.size)})
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Message Form */}
                                        <form onSubmit={handleSubmit} className="space-y-2">
                                            <div className="flex space-x-2">
                                                <Textarea
                                                    value={data.message}
                                                    onChange={(e) => setData('message', e.target.value)}
                                                    placeholder="Nhập tin nhắn..."
                                                    className="flex-1 min-h-[40px] max-h-[120px]"
                                                    maxLength={1000}
                                                    disabled={processing}
                                                />
                                                <div className="flex flex-col space-y-1">
                                                    {/* Image Upload Button */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => imageInputRef.current?.click()}
                                                        disabled={processing || selectedImages.length >= 3}
                                                        className="p-2"
                                                    >
                                                        <ImageIcon className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    {/* File Upload Button */}
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => fileInputRef.current?.click()}
                                                        disabled={processing || selectedFiles.length >= 5}
                                                        className="p-2"
                                                    >
                                                        <Paperclip className="w-4 h-4" />
                                                    </Button>
                                                    
                                                    {/* Send Button */}
                                                    <Button 
                                                        type="submit" 
                                                        disabled={processing || (!data.message.trim() && selectedImages.length === 0 && selectedFiles.length === 0)}
                                                        className="p-2"
                                                    >
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            {/* Hidden File Inputs */}
                                            <input
                                                ref={imageInputRef}
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                multiple
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />

                                            {/* Attachment Limits Info */}
                                            <div className="text-xs text-gray-500 space-y-1">
                                                <p>Tối đa 3 hình ảnh và 5 file cho mỗi tin nhắn</p>
                                                <p>Hình ảnh: {selectedImages.length}/3 | File: {selectedFiles.length}/5</p>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {error && (
                                    <p className="text-red-500 text-sm mt-1">{error}</p>
                                )}

                                {(transaction.status === 'completed' || transaction.status === 'cancelled') && (
                                    <Alert>
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>
                                            Giao dịch đã {transaction.status === 'completed' ? 'hoàn thành' : 'bị hủy'}. 
                                            Không thể gửi tin nhắn mới.
                                        </AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Transaction Info Sidebar */}
                    <div className="space-y-6">
                        {/* Transaction Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Package className="w-5 h-5 mr-2" />
                                    Thông tin giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Mô tả giao dịch</p>
                                    <p className="font-semibold">{transaction.description || 'N/A'}</p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Số tiền</p>
                                    <p className="text-lg font-bold text-green-600">
                                        {formatVND(transaction.amount)}
                                    </p>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Trạng thái</p>
                                    <Badge variant="outline" className="flex items-center space-x-1 w-fit">
                                        {getStatusIcon(transaction.status)}
                                        <span>{getStatusLabel(transaction.status)}</span>
                                    </Badge>
                                </div>

                                <Separator />

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngày tạo</p>
                                    <p className="text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-1" />
                                        {formatDateTime(transaction.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Other Participant Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <User className="w-5 h-5 mr-2" />
                                    Đối tác giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">Tên đăng nhập</p>
                                    <p className="font-semibold">{otherParticipant.username}</p>
                                </div>
                                
                                {otherParticipant.email && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Email</p>
                                        <p className="text-sm flex items-center">
                                            <Mail className='w-4 h-4 mr-2' />
                                            {otherParticipant.email}
                                            </p>
                                    </div>
                                )}
                                  {otherParticipant.phone && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-600">Số điện thoại</p>
                                        <p className="text-sm flex items-center">
                                            <PhoneCall className='w-4 h-4 mr-2' />
                                            {otherParticipant.phone}
                                            </p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-sm font-medium text-gray-600">Ngày tham gia</p>
                                    <p className="text-sm flex items-center">
                                        <Calendar className="w-4 h-4 mr-2" />
                                        {formatDateTime(otherParticipant.created_at)}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quick Actions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Thao tác nhanh</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Link href={`/customer/transactions/${transaction.id}`}>
                                    <Button variant="outline" className="w-full justify-start">
                                        <Package className="w-4 h-4 mr-2" />
                                        Xem chi tiết giao dịch
                                    </Button>
                                </Link>

                                {transaction.status === 'disputed' && transaction.dispute && (
                                    <Link href={`/customer/disputes/${transaction.dispute.id}`}>
                                        <Button variant="outline" className="w-full justify-start">
                                            <AlertCircle className="w-4 h-4 mr-2" />
                                            Xem tranh chấp
                                        </Button>
                                    </Link>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}
