import React from 'react';
import { Link } from '@inertiajs/react';
import { ArrowLeft, Shield, Eye, Lock, Database, Users, Bell, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AuthLayout from '@/layouts/AuthLayout';

export default function Privacy() {
    return (
        <AuthLayout title="Chính sách bảo mật">
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
                            <Shield className="mx-auto h-12 w-12 text-green-600 mb-4" />
                            <h1 className="text-3xl font-bold text-gray-900">Chính sách bảo mật</h1>
                            <p className="mt-2 text-lg text-gray-600">
                                Cam kết bảo vệ thông tin cá nhân của bạn
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Cam kết bảo mật */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Shield className="mr-2 h-5 w-5 text-green-600" />
                                    1. Cam kết bảo mật của chúng tôi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    Chúng tôi cam kết bảo vệ quyền riêng tư và thông tin cá nhân của bạn. 
                                    Chính sách này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ 
                                    thông tin của bạn khi sử dụng nền tảng giao dịch tài nguyên số của chúng tôi.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Thông tin thu thập */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Database className="mr-2 h-5 w-5 text-blue-600" />
                                    2. Thông tin chúng tôi thu thập
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Thông tin cá nhân:</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                                            <li>Họ tên, username, địa chỉ email</li>
                                            <li>Số điện thoại (nếu cung cấp)</li>
                                            <li>Thông tin thanh toán và giao dịch</li>
                                            <li>Lịch sử mua bán và hoạt động trên nền tảng</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Thông tin kỹ thuật:</h4>
                                        <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                                            <li>Địa chỉ IP, thông tin trình duyệt</li>
                                            <li>Thời gian truy cập và hoạt động</li>
                                            <li>Thiết bị sử dụng để truy cập</li>
                                            <li>Cookies và các công nghệ theo dõi tương tự</li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Mục đích sử dụng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Eye className="mr-2 h-5 w-5 text-purple-600" />
                                    3. Mục đích sử dụng thông tin
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi sử dụng thông tin của bạn cho các mục đích sau:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Cung cấp và duy trì dịch vụ nền tảng</li>
                                        <li>Xử lý giao dịch và thanh toán</li>
                                        <li>Xác minh danh tính và ngăn chặn gian lận</li>
                                        <li>Cải thiện trải nghiệm người dùng</li>
                                        <li>Gửi thông báo quan trọng về tài khoản</li>
                                        <li>Hỗ trợ khách hàng và xử lý khiếu nại</li>
                                        <li>Tuân thủ các yêu cầu pháp lý</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Bảo mật thông tin */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Lock className="mr-2 h-5 w-5 text-red-600" />
                                    4. Bảo mật thông tin
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi áp dụng các biện pháp bảo mật nghiêm ngặt:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Mã hóa SSL/TLS cho tất cả dữ liệu truyền tải</li>
                                        <li>Mã hóa mật khẩu bằng thuật toán bcrypt</li>
                                        <li>Hệ thống firewall và giám sát bảo mật 24/7</li>
                                        <li>Kiểm soát truy cập nghiêm ngặt cho nhân viên</li>
                                        <li>Sao lưu dữ liệu thường xuyên và an toàn</li>
                                        <li>Tuân thủ các tiêu chuẩn bảo mật quốc tế</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chia sẻ thông tin */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Users className="mr-2 h-5 w-5 text-orange-600" />
                                    5. Chia sẻ thông tin với bên thứ ba
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi chỉ chia sẻ thông tin của bạn trong các trường hợp sau:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Với sự đồng ý rõ ràng của bạn</li>
                                        <li>Với đối tác thanh toán để xử lý giao dịch</li>
                                        <li>Với cơ quan chức năng khi được yêu cầu pháp lý</li>
                                        <li>Với nhà cung cấp dịch vụ kỹ thuật (dưới cam kết bảo mật)</li>
                                        <li>Trong trường hợp sáp nhập hoặc mua bán công ty</li>
                                    </ul>
                                    <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                        <p className="text-yellow-800">
                                            ⚠️ <strong>Lưu ý:</strong> Chúng tôi không bao giờ bán thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Quyền của người dùng */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="mr-2 h-5 w-5 text-indigo-600" />
                                    6. Quyền của bạn đối với dữ liệu cá nhân
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li><strong>Quyền truy cập:</strong> Yêu cầu xem thông tin chúng tôi lưu trữ về bạn</li>
                                        <li><strong>Quyền chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin cá nhân</li>
                                        <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu</li>
                                        <li><strong>Quyền hạn chế:</strong> Giới hạn cách thức xử lý dữ liệu</li>
                                        <li><strong>Quyền phản đối:</strong> Từ chối việc xử lý dữ liệu</li>
                                        <li><strong>Quyền di chuyển:</strong> Yêu cầu xuất dữ liệu để chuyển sang nền tảng khác</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Cookies và theo dõi */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Database className="mr-2 h-5 w-5 text-teal-600" />
                                    7. Cookies và công nghệ theo dõi
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <p className="text-gray-700 leading-relaxed">
                                        Chúng tôi sử dụng cookies và các công nghệ tương tự để:
                                    </p>
                                    <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                                        <li>Ghi nhớ thông tin đăng nhập</li>
                                        <li>Cá nhân hóa trải nghiệm người dùng</li>
                                        <li>Phân tích lưu lượng truy cập</li>
                                        <li>Cải thiện hiệu suất website</li>
                                        <li>Ngăn chặn gian lận và bảo mật</li>
                                    </ul>
                                    <p className="text-gray-700 leading-relaxed mt-4">
                                        Bạn có thể quản lý cookies thông qua cài đặt trình duyệt, 
                                        tuy nhiên việc vô hiệu hóa có thể ảnh hưởng đến trải nghiệm sử dụng.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thay đổi chính sách */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Trash2 className="mr-2 h-5 w-5 text-gray-600" />
                                    8. Thay đổi chính sách bảo mật
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. 
                                    Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên website 
                                    ít nhất 30 ngày trước khi có hiệu lực. Việc tiếp tục sử dụng dịch vụ sau khi 
                                    thay đổi có hiệu lực đồng nghĩa với việc bạn chấp nhận chính sách mới.
                                </p>
                            </CardContent>
                        </Card>

                        {/* Liên hệ */}
                        <Card>
                            <CardHeader>
                                <CardTitle>9. Liên hệ về bảo mật</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-700 leading-relaxed">
                                    Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này hoặc muốn thực hiện quyền của mình, 
                                    vui lòng liên hệ:
                                </p>
                                <div className="mt-4 space-y-2">
                                    <p className="text-gray-700">📧 Email bảo mật: privacy@selling-resources.com</p>
                                    <p className="text-gray-700">📞 Hotline: 1900 1234</p>
                                    <p className="text-gray-700">🕒 Thời gian xử lý yêu cầu: Trong vòng 72 giờ</p>
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
                                <Button className="bg-green-600 hover:bg-green-700">
                                    Tôi hiểu và tiếp tục đăng ký
                                </Button>
                            </Link>
                            <Link href="/terms">
                                <Button variant="outline">
                                    Xem điều khoản sử dụng
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
