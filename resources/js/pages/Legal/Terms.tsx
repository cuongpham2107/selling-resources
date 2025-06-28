import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, FileText, Shield, AlertTriangle, Users, CreditCard, Gavel } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/AuthLayout';

export default function Terms() {
    return (
        <AuthLayout title="Điều khoản sử dụng">
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <Link href="/customer/register">
                            <Button variant="ghost" className="mb-4">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Quay lại đăng ký
                            </Button>
                        </Link>
                        <div className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                            <h1 className="text-3xl font-bold text-gray-900">Điều khoản sử dụng</h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Hiệu lực từ ngày 1 tháng 1, 2025
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Chấp nhận điều khoản */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="mr-2 h-5 w-5 text-green-600" />
                                    1. Chấp nhận điều khoản
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    Bằng việc truy cập và sử dụng nền tảng giao dịch tài nguyên số của chúng tôi, 
                                    bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản và điều kiện sử dụng này. 
                                    Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, 
                                    vui lòng không sử dụng dịch vụ của chúng tôi.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Định nghĩa dịch vụ */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5 text-blue-600" />
                                    2. Định nghĩa dịch vụ
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Nền tảng của chúng tôi cung cấp các dịch vụ sau:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Giao dịch mua bán tài nguyên số an toàn</li>
                                        <li>Hệ thống ví điện tử và quản lý điểm thưởng</li>
                                        <li>Chương trình giới thiệu và hoa hồng</li>
                                        <li>Hệ thống tranh chấp và bảo vệ người dùng</li>
                                        <li>Cửa hàng cá nhân và quản lý sản phẩm</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quyền và nghĩa vụ người dùng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-purple-600" />
                                    3. Quyền và nghĩa vụ người dùng
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Quyền của người dùng:</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                                            <li>Sử dụng tất cả tính năng của nền tảng</li>
                                            <li>Bảo vệ thông tin cá nhân theo chính sách bảo mật</li>
                                            <li>Nhận hỗ trợ kỹ thuật từ đội ngũ của chúng tôi</li>
                                            <li>Tham gia chương trình khuyến mãi và ưu đãi</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Nghĩa vụ của người dùng:</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                                            <li>Cung cấp thông tin chính xác và cập nhật</li>
                                            <li>Không sử dụng dịch vụ cho mục đích bất hợp pháp</li>
                                            <li>Tuân thủ các quy định về giao dịch và thanh toán</li>
                                            <li>Tôn trọng quyền lợi của người dùng khác</li>
                                            <li>Bảo mật thông tin đăng nhập tài khoản</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quy định giao dịch */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <CreditCard className="mr-2 h-5 w-5 text-orange-600" />
                                    4. Quy định giao dịch
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Tất cả giao dịch phải được thực hiện thông qua hệ thống của chúng tôi</li>
                                        <li>Người mua có quyền kiểm tra và yêu cầu hoàn tiền trong thời hạn quy định</li>
                                        <li>Người bán có trách nhiệm cung cấp sản phẩm/dịch vụ đúng như mô tả</li>
                                        <li>Phí giao dịch sẽ được tính theo bảng giá hiện hành</li>
                                        <li>Mọi tranh chấp sẽ được xử lý theo quy trình tranh chấp của nền tảng</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chính sách hoàn tiền */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <AlertTriangle className="mr-2 h-5 w-5 text-yellow-600" />
                                    5. Chính sách hoàn tiền và tranh chấp
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi cam kết bảo vệ quyền lợi của cả người mua và người bán:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Thời hạn khiếu nại: 7 ngày kể từ khi hoàn thành giao dịch</li>
                                        <li>Hoàn tiền 100% nếu sản phẩm không đúng mô tả</li>
                                        <li>Hệ thống trọng tài độc lập xử lý tranh chấp</li>
                                        <li>Bảo vệ bằng ký quỹ giao dịch</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Điều khoản pháp lý */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Gavel className="mr-2 h-5 w-5 text-red-600" />
                                    6. Điều khoản pháp lý
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Điều khoản này tuân thủ pháp luật Việt Nam</li>
                                        <li>Mọi tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền</li>
                                        <li>Chúng tôi có quyền thay đổi điều khoản với thông báo trước 30 ngày</li>
                                        <li>Nếu bất kỳ điều khoản nào không hợp lệ, các điều khoản khác vẫn có hiệu lực</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Liên hệ */}
                        <Card>
                            <CardHeader>
                                <CardTitle>7. Thông tin liên hệ</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    Nếu bạn có bất kỳ câu hỏi nào về điều khoản sử dụng này, 
                                    vui lòng liên hệ với chúng tôi qua:
                                </p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-700">📧 Email: support@selling-resources.com</p>
                                    <p className="text-gray-700">📞 Hotline: 1900 1234</p>
                                    <p className="text-gray-700">🕒 Thời gian hỗ trợ: 8:00 - 22:00 (Thứ 2 - Chủ nhật)</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Footer actions */}
                    <div className="mt-8 text-center space-y-4">
                        <p className="text-sm text-gray-500">
                            Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}
                        </p>
                        <div className="space-x-4">
                            <Link href="/customer/register">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    Tôi đồng ý và tiếp tục đăng ký
                                </Button>
                            </Link>
                            <Link href="/privacy">
                                <Button variant="outline">
                                    Xem chính sách bảo mật
                                </Button>
                            </Link>
                            <Link href="/customer/login">
                                <Button variant="ghost">
                                    Đăng nhập
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
}
