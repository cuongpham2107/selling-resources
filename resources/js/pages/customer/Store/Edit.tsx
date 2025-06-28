import React, { useState, FormEvent } from 'react';
import { Link, router, Head } from '@inertiajs/react';
import { ArrowLeft, Store, Image, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import CustomerLayout from '@/layouts/CustomerLayout';
import type { PersonalStore } from '@/types';

interface EditStorePageProps {
    store: PersonalStore;
    errors?: Record<string, string>;
    message?: string;
}

interface EditStoreForm {
    store_name: string;
    description: string;
    avatar?: File | null;
}

export default function EditStore({ store, errors = {}, message }: EditStorePageProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<EditStoreForm>({
        store_name: store.store_name || '',
        description: store.description || '',
        avatar: null,
    });

    const handleInputChange = (field: keyof EditStoreForm, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (field: 'avatar', file: File | null) => {
        setFormData(prev => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const submitData = new FormData();
            
            // Add text fields
            submitData.append('store_name', formData.store_name);
            submitData.append('description', formData.description);
            submitData.append('_method', 'PUT');

            // Add file fields
            if (formData.avatar) {
                submitData.append('avatar', formData.avatar);
            }

            await router.post(`/customer/store/${store.id}`, submitData, {
                forceFormData: true,
                onSuccess: () => {
                    // Will be redirected by the controller
                },
                onError: (errors) => {
                    console.error('Store update failed:', errors);
                },
                onFinish: () => {
                    setLoading(false);
                }
            });
        } catch (error) {
            console.error('Store update failed:', error);
            setLoading(false);
        }
    };

    const isFormValid = formData.store_name.trim() && formData.description.trim();

    return (
        <CustomerLayout>
            <Head title="Chỉnh sửa cửa hàng" />
            
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center gap-4">
                    <Link href="/customer/store">
                        <Button variant="ghost" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Quay lại
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Store className="h-8 w-8" />
                            Chỉnh sửa cửa hàng
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Cập nhật thông tin cửa hàng của bạn
                        </p>
                    </div>
                </div>

                {message && (
                    <Alert>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>
                                Cập nhật thông tin cơ bản về cửa hàng của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="store_name">
                                    Tên cửa hàng <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="store_name"
                                    type="text"
                                    placeholder="Nhập tên cửa hàng của bạn..."
                                    value={formData.store_name}
                                    onChange={(e) => handleInputChange('store_name', e.target.value)}
                                    className={errors.store_name ? 'border-red-500' : ''}
                                    required
                                />
                                {errors.store_name && (
                                    <p className="text-sm text-red-500">{errors.store_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">
                                    Mô tả cửa hàng <span className="text-red-500">*</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    placeholder="Mô tả về cửa hàng, sản phẩm, dịch vụ của bạn..."
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className={errors.description ? 'border-red-500' : ''}
                                    rows={4}
                                    required
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Store Images */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Hình ảnh cửa hàng
                            </CardTitle>
                            <CardDescription>
                                Cập nhật logo cho cửa hàng của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {store.avatar && (
                                <div className="space-y-2">
                                    <Label>Logo hiện tại</Label>
                                    <div className="flex items-center gap-4">
                                        <img 
                                            src={`/storage/${store.avatar}`} 
                                            alt="Store Avatar" 
                                            className="w-16 h-16 rounded-lg object-cover border"
                                        />
                                        <p className="text-sm text-gray-600">
                                            Logo hiện tại của cửa hàng
                                        </p>
                                    </div>
                                </div>
                            )}
                            
                            <div className="space-y-2">
                                <Label htmlFor="avatar">
                                    {store.avatar ? 'Thay đổi logo cửa hàng' : 'Logo cửa hàng'}
                                </Label>
                                <Input
                                    id="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange('avatar', e.target.files?.[0] || null)}
                                    className={errors.avatar ? 'border-red-500' : ''}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Kích thước tối đa: 2MB. Định dạng: JPG, PNG, GIF
                                </p>
                                {errors.avatar && (
                                    <p className="text-sm text-red-500 mt-1">{errors.avatar}</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Submit Button */}
                    <div className="flex justify-end gap-4">
                        <Link href="/customer/store">
                            <Button type="button" variant="outline">
                                Hủy bỏ
                            </Button>
                        </Link>
                        <Button 
                            type="submit" 
                            disabled={!isFormValid || loading}
                            className="flex items-center gap-2"
                        >
                            <Save className="h-4 w-4" />
                            {loading ? 'Đang cập nhật...' : 'Cập nhật cửa hàng'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}
