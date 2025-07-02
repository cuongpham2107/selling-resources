import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { 
    ArrowLeft, 
    Settings, 
    Bell, 
    Globe, 
    Palette, 
    Mail, 
    MessageSquare,
    Monitor,
    Sun,
    Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CustomerLayout from '@/layouts/CustomerLayout';
import type { Customer } from '@/types';

interface PreferencesData {
    notifications: {
        email_notifications: boolean;
        sms_notifications: boolean;
        push_notifications: boolean;
        marketing_emails: boolean;
        order_updates: boolean;
        security_alerts: boolean;
        weekly_reports: boolean;
    };
    appearance: {
        theme: 'light' | 'dark' | 'auto';
        language: string;
        timezone: string;
        currency: string;
    };
    privacy: {
        profile_visibility: 'public' | 'private' | 'friends';
        activity_visibility: boolean;
        data_sharing: boolean;
        analytics_tracking: boolean;
    };
    communication: {
        chat_notifications: boolean;
        email_frequency: 'immediate' | 'daily' | 'weekly' | 'never';
        notification_sound: boolean;
    };
}

interface ProfilePreferencesPageProps {
    customer: Customer;
    preferences: PreferencesData;
}

export default function ProfilePreferences({ preferences }: ProfilePreferencesPageProps) {
    const [activeTab, setActiveTab] = useState('notifications');
    
    const { data, setData, post, processing } = useForm({
        notifications: preferences.notifications,
        appearance: preferences.appearance,
        privacy: preferences.privacy,
        communication: preferences.communication,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customer/profile/preferences');
    };

    const updateNotification = (key: keyof typeof data.notifications, value: boolean) => {
        setData('notifications', {
            ...data.notifications,
            [key]: value
        });
    };

    const updateAppearance = (key: keyof typeof data.appearance, value: string) => {
        setData('appearance', {
            ...data.appearance,
            [key]: value
        });
    };

    const updatePrivacy = (key: keyof typeof data.privacy, value: boolean | string) => {
        setData('privacy', {
            ...data.privacy,
            [key]: value
        });
    };

    const updateCommunication = (key: keyof typeof data.communication, value: boolean | string) => {
        setData('communication', {
            ...data.communication,
            [key]: value
        });
    };

    return (
        <CustomerLayout>
            <div className="space-y-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/profile">
                            <Button variant="ghost" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tùy chọn cá nhân</h1>
                            <p className="text-gray-600">Tùy chỉnh trải nghiệm sử dụng theo ý muốn</p>
                        </div>
                    </div>
                    <Button onClick={handleSubmit} disabled={processing}>
                        {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                        <TabsTrigger value="appearance">Giao diện</TabsTrigger>
                        <TabsTrigger value="privacy">Riêng tư</TabsTrigger>
                        <TabsTrigger value="communication">Liên lạc</TabsTrigger>
                    </TabsList>

                    <TabsContent value="notifications" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Bell className="w-5 h-5 mr-2 text-blue-600" />
                                    Cài đặt thông báo
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Thông báo email</Label>
                                            <p className="text-sm text-gray-600">Nhận thông báo qua email</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.email_notifications}
                                            onCheckedChange={(value) => updateNotification('email_notifications', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Thông báo SMS</Label>
                                            <p className="text-sm text-gray-600">Nhận thông báo qua tin nhắn</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.sms_notifications}
                                            onCheckedChange={(value) => updateNotification('sms_notifications', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Thông báo đẩy</Label>
                                            <p className="text-sm text-gray-600">Nhận thông báo trên trình duyệt</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.push_notifications}
                                            onCheckedChange={(value) => updateNotification('push_notifications', value)}
                                        />
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-4">
                                    <h4 className="font-medium text-gray-900">Loại thông báo</h4>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Cập nhật đơn hàng</Label>
                                            <p className="text-sm text-gray-600">Thông báo về trạng thái đơn hàng</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.order_updates}
                                            onCheckedChange={(value) => updateNotification('order_updates', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Cảnh báo bảo mật</Label>
                                            <p className="text-sm text-gray-600">Thông báo về hoạt động bảo mật</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.security_alerts}
                                            onCheckedChange={(value) => updateNotification('security_alerts', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Email marketing</Label>
                                            <p className="text-sm text-gray-600">Nhận email về khuyến mãi và sản phẩm mới</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.marketing_emails}
                                            onCheckedChange={(value) => updateNotification('marketing_emails', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Báo cáo hàng tuần</Label>
                                            <p className="text-sm text-gray-600">Tóm tắt hoạt động hàng tuần</p>
                                        </div>
                                        <Switch
                                            checked={data.notifications.weekly_reports}
                                            onCheckedChange={(value) => updateNotification('weekly_reports', value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="appearance" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Palette className="w-5 h-5 mr-2 text-purple-600" />
                                    Giao diện và hiển thị
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Chủ đề giao diện</Label>
                                        <RadioGroup 
                                            value={data.appearance.theme} 
                                            onValueChange={(value) => updateAppearance('theme', value)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="light" id="light" />
                                                <Label htmlFor="light" className="flex items-center space-x-2 cursor-pointer">
                                                    <Sun className="w-4 h-4" />
                                                    <span>Sáng</span>
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="dark" id="dark" />
                                                <Label htmlFor="dark" className="flex items-center space-x-2 cursor-pointer">
                                                    <Moon className="w-4 h-4" />
                                                    <span>Tối</span>
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="auto" id="auto" />
                                                <Label htmlFor="auto" className="flex items-center space-x-2 cursor-pointer">
                                                    <Monitor className="w-4 h-4" />
                                                    <span>Tự động</span>
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Ngôn ngữ</Label>
                                        <Select value={data.appearance.language} onValueChange={(value) => updateAppearance('language', value)}>
                                            <SelectTrigger>
                                                <Globe className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="vi">Tiếng Việt</SelectItem>
                                                <SelectItem value="en">English</SelectItem>
                                                <SelectItem value="zh">中文</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Múi giờ</Label>
                                        <Select value={data.appearance.timezone} onValueChange={(value) => updateAppearance('timezone', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Asia/Ho_Chi_Minh">GMT+7 (Hồ Chí Minh)</SelectItem>
                                                <SelectItem value="Asia/Bangkok">GMT+7 (Bangkok)</SelectItem>
                                                <SelectItem value="Asia/Singapore">GMT+8 (Singapore)</SelectItem>
                                                <SelectItem value="Asia/Tokyo">GMT+9 (Tokyo)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Đơn vị tiền tệ</Label>
                                        <Select value={data.appearance.currency} onValueChange={(value) => updateAppearance('currency', value)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="VND">₫ Việt Nam Đồng</SelectItem>
                                                <SelectItem value="USD">$ US Dollar</SelectItem>
                                                <SelectItem value="EUR">€ Euro</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="privacy" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Settings className="w-5 h-5 mr-2 text-green-600" />
                                    Cài đặt riêng tư
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Hiển thị hồ sơ</Label>
                                        <RadioGroup 
                                            value={data.privacy.profile_visibility} 
                                            onValueChange={(value) => updatePrivacy('profile_visibility', value)}
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="public" id="public" />
                                                <Label htmlFor="public" className="cursor-pointer">
                                                    Công khai - Mọi người có thể xem
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="friends" id="friends" />
                                                <Label htmlFor="friends" className="cursor-pointer">
                                                    Bạn bè - Chỉ người quen có thể xem
                                                </Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="private" id="private" />
                                                <Label htmlFor="private" className="cursor-pointer">
                                                    Riêng tư - Chỉ mình tôi có thể xem
                                                </Label>
                                            </div>
                                        </RadioGroup>
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Hiển thị hoạt động</Label>
                                            <p className="text-sm text-gray-600">Cho phép người khác thấy hoạt động của bạn</p>
                                        </div>
                                        <Switch
                                            checked={data.privacy.activity_visibility}
                                            onCheckedChange={(value) => updatePrivacy('activity_visibility', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Chia sẻ dữ liệu</Label>
                                            <p className="text-sm text-gray-600">Chia sẻ dữ liệu để cải thiện dịch vụ</p>
                                        </div>
                                        <Switch
                                            checked={data.privacy.data_sharing}
                                            onCheckedChange={(value) => updatePrivacy('data_sharing', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Theo dõi phân tích</Label>
                                            <p className="text-sm text-gray-600">Cho phép thu thập dữ liệu phân tích</p>
                                        </div>
                                        <Switch
                                            checked={data.privacy.analytics_tracking}
                                            onCheckedChange={(value) => updatePrivacy('analytics_tracking', value)}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="communication" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <MessageSquare className="w-5 h-5 mr-2 text-orange-600" />
                                    Tùy chọn liên lạc
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Thông báo chat</Label>
                                            <p className="text-sm text-gray-600">Nhận thông báo khi có tin nhắn mới</p>
                                        </div>
                                        <Switch
                                            checked={data.communication.chat_notifications}
                                            onCheckedChange={(value) => updateCommunication('chat_notifications', value)}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <Label className="text-base font-medium">Âm thanh thông báo</Label>
                                            <p className="text-sm text-gray-600">Phát âm thanh khi có thông báo</p>
                                        </div>
                                        <Switch
                                            checked={data.communication.notification_sound}
                                            onCheckedChange={(value) => updateCommunication('notification_sound', value)}
                                        />
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <Label className="text-base font-medium">Tần suất email</Label>
                                        <Select 
                                            value={data.communication.email_frequency} 
                                            onValueChange={(value) => updateCommunication('email_frequency', value)}
                                        >
                                            <SelectTrigger>
                                                <Mail className="w-4 h-4 mr-2" />
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="immediate">Ngay lập tức</SelectItem>
                                                <SelectItem value="daily">Hàng ngày</SelectItem>
                                                <SelectItem value="weekly">Hàng tuần</SelectItem>
                                                <SelectItem value="never">Không bao giờ</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </CustomerLayout>
    );
}
