import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CustomerLayout from '@/layouts/CustomerLayout';
import { router } from '@inertiajs/react';
import { 
    AlertCircle, 
    ArrowLeft, 
    CheckCircle2, 
    Clock, 
    MessageSquare, 
    Shield, 
    Users, 
    XCircle,
    BookOpen
} from 'lucide-react';
import React from 'react';

interface RulesPageProps {
    rules: string[];
}

export default function Rules({ rules }: RulesPageProps) {
    const handleBackToChat = () => {
        router.get('/customer/chat/general/room');
    };

    // Parse rules to categorize them
    const categorizedRules = {
        allowed: [
            'Tôn trọng người dùng khác',
            'Thảo luận về sản phẩm và dịch vụ',
            'Chia sẻ kinh nghiệm mua sắm tích cực',
            'Hỏi đáp và hỗ trợ lẫn nhau',
            'Giữ cuộc trò chuyện liên quan đến giao dịch',
        ],
        forbidden: [
            'Không spam hoặc quảng cáo không phù hợp',
            'Không sử dụng ngôn ngữ thiếu văn hóa',
            'Không chia sẻ thông tin liên lạc cá nhân',
            'Không thực hiện gian lận hoặc lừa đảo',
            'Không quấy rối hoặc đe dọa người khác',
        ],
        limits: rules.filter(rule => 
            rule.includes('giới hạn') || 
            rule.includes('mỗi giờ') || 
            rule.includes('hàng ngày')
        ),
        reporting: [
            'Báo cáo hành vi không phù hợp ngay lập tức',
            'Sử dụng tính năng báo cáo có sẵn trong chat',
            'Cung cấp thông tin chi tiết khi báo cáo',
            'Không spam báo cáo không cần thiết',
        ]
    };

    return (
        <CustomerLayout title="Quy Tắc Chat Tổng">
            <div className="mx-auto max-w-4xl space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleBackToChat}
                            className="flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại Chat
                        </Button>
                        <div>
                            <h1 className="flex items-center text-2xl font-bold text-gray-900">
                                <BookOpen className="mr-2 h-6 w-6 text-blue-600" />
                                Quy Tắc Chat Tổng
                            </h1>
                            <p className="text-gray-600">Hướng dẫn và quy định sử dụng phòng chat công khai</p>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <Alert className="border-amber-200 bg-amber-50">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">
                        <strong>Lưu ý quan trọng:</strong> Vi phạm quy tắc có thể dẫn đến việc tạm khóa hoặc cấm vĩnh viễn tài khoản. 
                        Vui lòng đọc kỹ và tuân thủ các quy định dưới đây.
                    </AlertDescription>
                </Alert>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Allowed Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-green-600">
                                <CheckCircle2 className="h-5 w-5" />
                                Được Khuyến Khích
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {categorizedRules.allowed.map((rule, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{rule}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Forbidden Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-red-600">
                                <XCircle className="h-5 w-5" />
                                Nghiêm Cấm
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {categorizedRules.forbidden.map((rule, index) => (
                                <div key={index} className="flex items-start gap-3">
                                    <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">{rule}</span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Usage Limits */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-600">
                            <Clock className="h-5 w-5" />
                            Giới Hạn Sử Dụng
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {categorizedRules.limits.map((rule, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{rule}</span>
                            </div>
                        ))}
                        {categorizedRules.limits.length === 0 && (
                            <>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Mỗi người dùng có thể gửi tối đa 3 tin nhắn mỗi ngày</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Clock className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm text-gray-700">Chỉ được gửi tin nhắn mỗi giờ một lần</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Reporting Guidelines */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-purple-600">
                            <Shield className="h-5 w-5" />
                            Hướng Dẫn Báo Cáo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {categorizedRules.reporting.map((rule, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <Shield className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{rule}</span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Additional Information */}
                <Card className="border-gray-200 bg-gray-50">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                            <Users className="h-5 w-5" />
                            Thông Tin Thêm
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Mục đích phòng chat:</h4>
                            <p className="text-sm text-gray-600">
                                Phòng chat tổng được tạo ra để kết nối cộng đồng người mua và người bán, 
                                tạo môi trường giao dịch minh bạch và an toàn.
                            </p>
                        </div>
                        
                        <div className="space-y-2">
                            <h4 className="font-medium text-gray-800">Liên hệ hỗ trợ:</h4>
                            <p className="text-sm text-gray-600">
                                Nếu bạn gặp vấn đề hoặc cần hỗ trợ, vui lòng sử dụng tính năng báo cáo 
                                hoặc liên hệ với đội ngũ quản trị viên.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Badge variant="secondary" className="text-xs">
                                Cập nhật: {new Date().toLocaleDateString('vi-VN')}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                                Phiên bản: 1.0
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 pt-4">
                    <Button 
                        onClick={handleBackToChat}
                        className="flex items-center gap-2"
                    >
                        <MessageSquare className="h-4 w-4" />
                        Vào Phòng Chat
                    </Button>
                </div>
            </div>
        </CustomerLayout>
    );
}
