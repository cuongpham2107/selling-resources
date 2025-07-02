import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Gift,
    Users,
    Star,
    Shield,
    AlertTriangle,
    CheckCircle,
    Coins,
    TrendingUp,
    Target,
} from 'lucide-react';

interface Props {
    programDetails: {
        how_it_works: string[];
        earning_structure: Record<string, string>;
        requirements: string[];
        limits: string[];
    };
}

export default function ReferralsProgram({ programDetails }: Props) {
    return (
        <CustomerLayout>
            <Head title="Quy định chương trình giới thiệu" />

            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Quy định chương trình giới thiệu</h1>
                        <p className="text-gray-600">
                            Tìm hiểu cách thức hoạt động và các quy định của chương trình
                        </p>
                    </div>  
                    <Link href={route('customer.referrals.index')}>
                        <Button variant="outline">
                            Quay lại
                        </Button>
                    </Link>
                </div>

                {/* Program Overview */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Gift className="h-6 w-6" />
                            Tổng quan chương trình
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <Users className="h-12 w-12 mx-auto mb-2 text-blue-100" />
                                <div className="text-2xl font-bold">Không giới hạn</div>
                                <div className="text-blue-100">Số lượng giới thiệu</div>
                            </div>
                            <div className="text-center">
                                <Coins className="h-12 w-12 mx-auto mb-2 text-blue-100" />
                                <div className="text-2xl font-bold">50-200</div>
                                <div className="text-blue-100">Điểm thưởng/người</div>
                            </div>
                            <div className="text-center">
                                <TrendingUp className="h-12 w-12 mx-auto mb-2 text-blue-100" />
                                <div className="text-2xl font-bold">5%</div>
                                <div className="text-blue-100">Hoa hồng hàng tháng</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* How It Works */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5 text-blue-600" />
                            Cách thức hoạt động
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {programDetails.how_it_works.map((step, index) => (
                                <div key={index} className="flex items-start gap-4">
                                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold text-sm">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-gray-700">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Earning Structure */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5 text-yellow-600" />
                            Cấu trúc thưởng
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(programDetails.earning_structure).map(([key, value]) => (
                                <div key={key} className="p-4 border rounded-lg">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Star className="h-4 w-4 text-yellow-500" />
                                        <h4 className="font-semibold text-gray-900">{key}</h4>
                                    </div>
                                    <p className="text-gray-600 text-sm">{value}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Requirements */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Điều kiện tham gia
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {programDetails.requirements.map((requirement, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{requirement}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Limits */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-600" />
                                Giới hạn và lưu ý
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {programDetails.limits.map((limit, index) => (
                                    <div key={index} className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm text-gray-700">{limit}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bonus Tiers */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            Bậc thưởng đặc biệt
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-4 border rounded-lg text-center">
                                <Badge className="bg-bronze-100 text-bronze-800 mb-2">Đồng</Badge>
                                <div className="text-lg font-semibold mb-1">1-4 giới thiệu</div>
                                <div className="text-sm text-gray-600">Thưởng cơ bản</div>
                                <div className="text-xs text-gray-500 mt-2">50 điểm/người</div>
                            </div>
                            <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg text-center">
                                <Badge className="bg-blue-100 text-blue-800 mb-2">Bạc</Badge>
                                <div className="text-lg font-semibold mb-1">5-9 giới thiệu</div>
                                <div className="text-sm text-gray-600">Thưởng nâng cao</div>
                                <div className="text-xs text-gray-500 mt-2">75 điểm/người + 100 bonus</div>
                            </div>
                            <div className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg text-center">
                                <Badge className="bg-yellow-100 text-yellow-800 mb-2">Vàng</Badge>
                                <div className="text-lg font-semibold mb-1">10+ giới thiệu</div>
                                <div className="text-sm text-gray-600">Thưởng cao cấp</div>
                                <div className="text-xs text-gray-500 mt-2">100 điểm/người + 200 bonus</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Terms and Conditions */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-blue-600" />
                            Điều khoản và điều kiện
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 text-sm text-gray-600">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">1. Quy định chung</h4>
                                <ul className="space-y-1 ml-4">
                                    <li>• Chương trình có thể thay đổi hoặc kết thúc bất kỳ lúc nào</li>
                                    <li>• Điểm thưởng sẽ được cộng sau khi xác nhận thành công</li>
                                    <li>• Mỗi người chỉ có thể sử dụng một mã giới thiệu</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">2. Thanh toán thưởng</h4>
                                <ul className="space-y-1 ml-4">
                                    <li>• Thưởng đăng ký: Ngay khi hoàn thành xác minh</li>
                                    <li>• Thưởng mua hàng đầu tiên: Sau 24h kể từ khi giao dịch thành công</li>
                                    <li>• Hoa hồng hàng tháng: Vào ngày 1 hàng tháng</li>
                                </ul>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">3. Hành vi bị cấm</h4>
                                <ul className="space-y-1 ml-4">
                                    <li>• Tạo tài khoản ảo để tự giới thiệu</li>
                                    <li>• Spam hoặc gửi tin nhắn rác</li>
                                    <li>• Vi phạm các quy định của nền tảng</li>
                                </ul>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <Card className="bg-gradient-to-r from-green-500 to-blue-600 text-white">
                    <CardContent className="p-6 text-center">
                        <Gift className="h-12 w-12 mx-auto mb-4 text-green-100" />
                        <h3 className="text-xl font-bold mb-2">Sẵn sàng bắt đầu?</h3>
                        <p className="text-green-100 mb-4">
                            Chia sẻ mã giới thiệu và bắt đầu kiếm điểm thưởng ngay hôm nay!
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Link href={route('customer.referrals.share')}>
                                <Button variant="secondary" className="bg-white text-green-600 hover:bg-gray-100">
                                    Chia sẻ ngay
                                </Button>
                            </Link>
                            <Link href={route('customer.referrals.index')}>
                                <Button variant="outline" className="border-white text-white hover:bg-white/10">
                                    Xem dashboard
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
