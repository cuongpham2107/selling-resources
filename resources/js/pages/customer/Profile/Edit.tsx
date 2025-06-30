import React, { useState } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, User, Mail, Phone, FileText, Upload, X, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomerLayout from '@/layouts/CustomerLayout';
import type { Customer } from '@/types';

interface ProfileEditPageProps {
    customer: Customer;
}

export default function ProfileEdit({ customer }: ProfileEditPageProps) {
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    
    const { data, setData, post, processing, errors, recentlySuccessful } = useForm({
        full_name: customer.full_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        bio: customer.bio || '',
        avatar: null as File | null,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('avatar', file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setData('avatar', null);
        setPreviewImage(null);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('customer.profile.update'), {
            forceFormData: true,
        });
    };

    const deleteAvatar = () => {
        if (confirm('Bạn có chắc chắn muốn xóa ảnh đại diện?')) {
            window.location.href = route('customer.profile.avatar.delete');
        }
    };

    return (
        <CustomerLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/profile">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Chỉnh sửa hồ sơ</h1>
                            <p className="text-gray-600">Cập nhật thông tin cá nhân của bạn</p>
                        </div>
                    </div>
                </div>

                {recentlySuccessful && (
                    <Alert>
                        <AlertDescription>
                            Hồ sơ đã được cập nhật thành công!
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Avatar Section */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center">
                                    <Camera className="w-5 h-5 mr-2 text-blue-600" />
                                    Ảnh đại diện
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="text-center">
                                    <Avatar className="w-32 h-32 mx-auto mb-4">
                                        <AvatarImage 
                                            src={previewImage || (customer.avatar ? `/storage/${customer.avatar}` : undefined)} 
                                        />
                                        <AvatarFallback className="text-3xl">
                                            {customer.full_name?.charAt(0).toUpperCase() || customer.username?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    
                                    <div className="space-y-2">
                                        <Label htmlFor="avatar-upload" className="cursor-pointer">
                                            <Button type="button" variant="outline" asChild>
                                                <span>
                                                    <Upload className="w-4 h-4 mr-2" />
                                                    Chọn ảnh mới
                                                </span>
                                            </Button>
                                        </Label>
                                        <Input
                                            id="avatar-upload"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        
                                        {(previewImage || customer.avatar) && (
                                            <div className="flex space-x-2 justify-center">
                                                {previewImage && (
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={removeImage}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Hủy
                                                    </Button>
                                                )}
                                                {customer.avatar && !previewImage && (
                                                    <Button
                                                        type="button"
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={deleteAvatar}
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Xóa ảnh
                                                    </Button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {errors.avatar && (
                                        <p className="text-sm text-red-600 mt-2">{errors.avatar}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Form Fields */}
                        <div className="lg:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center">
                                        <User className="w-5 h-5 mr-2 text-blue-600" />
                                        Thông tin cá nhân
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="full_name">Họ và tên</Label>
                                            <Input
                                                id="full_name"
                                                type="text"
                                                value={data.full_name}
                                                onChange={(e) => setData('full_name', e.target.value)}
                                                placeholder="Nhập họ và tên"
                                            />
                                            {errors.full_name && (
                                                <p className="text-sm text-red-600">{errors.full_name}</p>
                                            )}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="email">Email</Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={data.email}
                                                    onChange={(e) => setData('email', e.target.value)}
                                                    className="pl-10"
                                                    placeholder="your@email.com"
                                                />
                                            </div>
                                            {errors.email && (
                                                <p className="text-sm text-red-600">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="phone">Số điện thoại</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                className="pl-10"
                                                placeholder="0123456789"
                                            />
                                        </div>
                                        {errors.phone && (
                                            <p className="text-sm text-red-600">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bio">Tiểu sử</Label>
                                        <div className="relative">
                                            <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <Textarea
                                                id="bio"
                                                value={data.bio}
                                                onChange={(e) => setData('bio', e.target.value)}
                                                className="pl-10 min-h-[100px]"
                                                placeholder="Viết vài dòng về bản thân..."
                                                maxLength={500}
                                            />
                                        </div>
                                        <div className="flex justify-between items-center">
                                            {errors.bio && (
                                                <p className="text-sm text-red-600">{errors.bio}</p>
                                            )}
                                            <p className="text-sm text-gray-500 ml-auto">
                                                {data.bio.length}/500 ký tự
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3 pt-4">
                                        <Link href="/customer/profile">
                                            <Button type="button" variant="outline">
                                                Hủy
                                            </Button>
                                        </Link>
                                        <Button type="submit" disabled={processing}>
                                            {processing ? 'Đang lưu...' : 'Lưu thay đổi'}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}
