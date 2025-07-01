import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Share2,
    Copy,
    Facebook,
    Twitter,
    MessageCircle,
    Mail,
    Link as LinkIcon,
    Download,
    QrCode
} from 'lucide-react';

interface Props {
    referralCode: string;
    referralLink: string;
    shareMessages: string[];
}

export default function ReferralsShare({ referralCode, referralLink, shareMessages }: Props) {
    const [copied, setCopied] = React.useState<string | null>(null);
    const [selectedMessage, setSelectedMessage] = React.useState(shareMessages[0] || '');

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    const shareVia = (platform: string) => {
        const encodedMessage = encodeURIComponent(selectedMessage);
        const encodedLink = encodeURIComponent(referralLink);
        
        const urls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}&quote=${encodedMessage}`,
            twitter: `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedLink}`,
            whatsapp: `https://wa.me/?text=${encodedMessage}%20${encodedLink}`,
            telegram: `https://t.me/share/url?url=${encodedLink}&text=${encodedMessage}`,
            email: `mailto:?subject=Lời mời tham gia&body=${encodedMessage}%0A%0A${encodedLink}`
        };

        if (urls[platform as keyof typeof urls]) {
            window.open(urls[platform as keyof typeof urls], '_blank');
        }
    };

    return (
        <CustomerLayout>
            <Head title="Chia sẻ giới thiệu" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Chia sẻ mã giới thiệu</h1>
                        <p className="text-gray-600">
                            Chia sẻ và kiếm điểm thưởng khi bạn bè tham gia
                        </p>
                    </div>
                    <Link href={route('customer.referrals.index')}>
                        <Button variant="outline">
                            Quay lại
                        </Button>
                    </Link>
                </div>

                {/* Referral Code Display */}
                <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Share2 className="h-6 w-6" />
                            Mã giới thiệu của bạn
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <Label className="text-blue-100">Mã giới thiệu</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        value={referralCode}
                                        readOnly
                                        className="bg-white/20 border-white/30 text-white text-2xl font-mono font-bold text-center"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(referralCode, 'code')}
                                        variant="secondary"
                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                {copied === 'code' && (
                                    <p className="text-green-200 text-sm mt-1">Đã sao chép mã!</p>
                                )}
                            </div>

                            <div>
                                <Label className="text-blue-100">Link giới thiệu</Label>
                                <div className="flex items-center gap-2 mt-1">
                                    <Input
                                        value={referralLink}
                                        readOnly
                                        className="bg-white/20 border-white/30 text-white"
                                    />
                                    <Button
                                        onClick={() => copyToClipboard(referralLink, 'link')}
                                        variant="secondary"
                                        className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                                {copied === 'link' && (
                                    <p className="text-green-200 text-sm mt-1">Đã sao chép link!</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Share Message */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tin nhắn chia sẻ</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="message">Chọn hoặc tùy chỉnh tin nhắn</Label>
                                <Textarea
                                    id="message"
                                    value={selectedMessage}
                                    onChange={(e) => setSelectedMessage(e.target.value)}
                                    rows={4}
                                    className="mt-1"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Mẫu tin nhắn có sẵn</Label>
                                {shareMessages.map((message, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedMessage === message ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setSelectedMessage(message)}
                                        className="w-full text-left justify-start h-auto py-2 px-3"
                                    >
                                        <div className="text-xs leading-relaxed">
                                            {message}
                                        </div>
                                    </Button>
                                ))}
                            </div>

                            <Button
                                onClick={() => copyToClipboard(selectedMessage, 'message')}
                                variant="outline"
                                className="w-full"
                            >
                                <Copy className="h-4 w-4 mr-2" />
                                {copied === 'message' ? 'Đã sao chép!' : 'Sao chép tin nhắn'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Share Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Chia sẻ qua</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={() => shareVia('facebook')}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    <Facebook className="h-4 w-4 mr-2" />
                                    Facebook
                                </Button>

                                <Button
                                    onClick={() => shareVia('twitter')}
                                    className="bg-sky-500 hover:bg-sky-600 text-white"
                                >
                                    <Twitter className="h-4 w-4 mr-2" />
                                    Twitter
                                </Button>

                                <Button
                                    onClick={() => shareVia('whatsapp')}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    WhatsApp
                                </Button>

                                <Button
                                    onClick={() => shareVia('telegram')}
                                    className="bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Telegram
                                </Button>

                                <Button
                                    onClick={() => shareVia('email')}
                                    variant="outline"
                                    className="col-span-2"
                                >
                                    <Mail className="h-4 w-4 mr-2" />
                                    Email
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t">
                                <div className="space-y-3">
                                    <Button
                                        onClick={() => copyToClipboard(referralLink, 'share-link')}
                                        variant="outline"
                                        className="w-full"
                                    >
                                        <LinkIcon className="h-4 w-4 mr-2" />
                                        {copied === 'share-link' ? 'Đã sao chép!' : 'Sao chép link'}
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled
                                    >
                                        <QrCode className="h-4 w-4 mr-2" />
                                        Tạo mã QR (Sắp có)
                                    </Button>

                                    <Button
                                        variant="outline"
                                        className="w-full"
                                        disabled
                                    >
                                        <Download className="h-4 w-4 mr-2" />
                                        Tải banner (Sắp có)
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tips */}
                <Card>
                    <CardHeader>
                        <CardTitle>Mẹo chia sẻ hiệu quả</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <h4 className="font-medium">📱 Mạng xã hội</h4>
                                <p className="text-sm text-gray-600">
                                    Chia sẻ trên Facebook, Twitter để tiếp cận nhiều người
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">💬 Tin nhắn cá nhân</h4>
                                <p className="text-sm text-gray-600">
                                    Gửi trực tiếp qua WhatsApp, Telegram cho bạn bè thân
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">📧 Email</h4>
                                <p className="text-sm text-gray-600">
                                    Gửi email chi tiết với lời giải thích về lợi ích
                                </p>
                            </div>
                            <div className="space-y-2">
                                <h4 className="font-medium">🎯 Nhóm quan tâm</h4>
                                <p className="text-sm text-gray-600">
                                    Chia sẻ trong các nhóm có cùng sở thích kinh doanh
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
