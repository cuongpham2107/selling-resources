import React from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Shield, AlertTriangle, CheckCircle, Clock, FileText, MessageSquare, Scale, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import CustomerLayout from '@/layouts/CustomerLayout';

interface GuidelinesData {
    [key: string]: string[] | { [key: string]: string };
}

interface DisputeGuidelinesPageProps {
    guidelines: GuidelinesData;
}

export default function DisputeGuidelines({ guidelines }: DisputeGuidelinesPageProps) {
    return (
        <CustomerLayout>
            <Head title="Hướng dẫn tranh chấp" />
            
            <div className="mx-auto max-w-5xl space-y-6">
                {/* Header */}
                <div className="flex flex-col items-start space-y-4">
                    <Link href="/customer/disputes">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Hướng dẫn tranh chấp</h1>
                        <p className="text-gray-600">Tìm hiểu cách thức hoạt động của hệ thống tranh chấp</p>
                    </div>
                </div>

                {/* Important Notice */}
                <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                        <strong>Lưu ý quan trọng:</strong> Tranh chấp chỉ nên được sử dụng cho các vấn đề thực sự. 
                        Việc tạo tranh chấp giả mạo có thể dẫn đến việc tài khoản bị tạm ngưng hoặc khóa vĩnh viễn.
                    </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                        {/* When to file a dispute */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
                                    Khi nào nên tạo tranh chấp
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(guidelines['When to file a dispute'] as string[])?.map((reason, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-gray-700">{reason}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Evidence to provide */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <FileText className="w-5 h-5 mr-2 text-blue-500" />
                                    Bằng chứng cần cung cấp
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(guidelines['Evidence to provide'] as string[])?.map((evidence, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                            <p className="text-gray-700">{evidence}</p>
                                        </div>
                                    ))}
                                </div>
                                
                                <Separator className="my-4" />
                                
                                <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium text-blue-900 mb-2">Mẹo hữu ích:</h4>
                                    <ul className="text-sm text-blue-800 space-y-1">
                                        <li>• Chụp ảnh màn hình ngay khi phát hiện vấn đề</li>
                                        <li>• Lưu lại tất cả tin nhắn với người bán</li>
                                        <li>• Ghi chú thời gian và ngày tháng xảy ra sự cố</li>
                                        <li>• Tệp tải lên không quá 10MB mỗi tệp</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Resolution process */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Scale className="w-5 h-5 mr-2 text-green-500" />
                                    Quy trình giải quyết
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {(guidelines['Resolution process'] as string[])?.map((step, index) => (
                                        <div key={index} className="flex items-start space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-green-600">
                                                        {index + 1}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-gray-700">{step}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="text-center p-3 bg-green-50 rounded-lg">
                                        <Clock className="w-6 h-6 text-green-600 mx-auto mb-1" />
                                        <p className="text-sm font-medium text-green-800">Thời gian xử lý</p>
                                        <p className="text-xs text-green-600">5-7 ngày làm việc</p>
                                    </div>
                                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                                        <MessageSquare className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                                        <p className="text-sm font-medium text-blue-800">Phản hồi 24/7</p>
                                        <p className="text-xs text-blue-600">Hỗ trợ liên tục</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Important notes */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <HelpCircle className="w-5 h-5 mr-2 text-purple-500" />
                                    Ghi chú quan trọng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {(guidelines['Important notes'] as string[])?.map((note, index) => (
                                        <div key={index} className="flex items-start space-x-3">
                                            <AlertTriangle className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                                            <p className="text-gray-700">{note}</p>
                                        </div>
                                    ))}
                                </div>

                                <Separator className="my-4" />

                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                    <h4 className="font-medium text-purple-900 mb-2">Kết quả có thể:</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                                                Hoàn tiền đầy đủ
                                            </Badge>
                                            <span className="text-sm text-gray-600">Khi người mua đúng hoàn toàn</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50">
                                                Thanh toán cho người bán
                                            </Badge>
                                            <span className="text-sm text-gray-600">Khi người bán đúng hoàn toàn</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Badge variant="outline" className="border-purple-200 text-purple-700 bg-purple-50">
                                                Hoàn tiền một phần
                                            </Badge>
                                            <span className="text-sm text-gray-600">Khi cả hai bên có lỗi</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* FAQ Section */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Câu hỏi thường gặp
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Tôi có thể hủy tranh chấp sau khi tạo không?</h4>
                                    <p className="text-sm text-gray-600">
                                        Có, bạn có thể hủy tranh chấp trong khi nó đang ở trạng thái "Đang chờ" hoặc "Đang xử lý".
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium mb-2">Điều gì xảy ra nếu người bán không phản hồi?</h4>
                                    <p className="text-sm text-gray-600">
                                        Sau 48 giờ không phản hồi, tranh chấp sẽ được chuyển đến đội ngũ hỗ trợ để xử lý.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Tôi có thể nâng cấp tranh chấp không?</h4>
                                    <p className="text-sm text-gray-600">
                                        Có, nếu tranh chấp đang xử lý quá 48 giờ, bạn có thể yêu cầu nâng cấp lên cấp cao hơn.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium mb-2">Phí tranh chấp là bao nhiêu?</h4>
                                    <p className="text-sm text-gray-600">
                                        Hiện tại không có phí tranh chấp. Tuy nhiên, việc lạm dụng có thể dẫn đến hạn chế tài khoản.
                                    </p>
                                </div>
                                
                                <div>
                                    <h4 className="font-medium mb-2">Khi nào tiền sẽ được hoàn lại?</h4>
                                    <p className="text-sm text-gray-600">
                                        Tiền sẽ được hoàn lại trong vòng 3-5 ngày làm việc sau khi tranh chấp được giải quyết.
                                    </p>
                                </div>

                                <div>
                                    <h4 className="font-medium mb-2">Tôi có thể khiếu nại kết quả không?</h4>
                                    <p className="text-sm text-gray-600">
                                        Kết quả từ đội ngũ hỗ trợ là cuối cùng. Tuy nhiên, bạn có thể liên hệ trực tiếp nếu có vấn đề nghiêm trọng.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                    <Link href="/customer/disputes/create">
                        <Button>
                            Tạo tranh chấp mới
                        </Button>
                    </Link>
                    <Link href="/customer/disputes">
                        <Button variant="outline">
                            Xem danh sách tranh chấp
                        </Button>
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}
