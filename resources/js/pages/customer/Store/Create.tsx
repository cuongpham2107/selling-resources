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

interface CreateStorePageProps {
    errors?: Record<string, string>;
    message?: string;
}

interface CreateStoreForm {
    store_name: string;
    description: string;
    avatar?: File | null;
}

export default function CreateStore({ errors = {}, message }: CreateStorePageProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CreateStoreForm>({
        store_name: '',
        description: '',
        avatar: null,
    });

    const handleInputChange = (field: keyof CreateStoreForm, value: string) => {
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
            Object.entries(formData).forEach(([key, value]) => {
                if (value && typeof value === 'string') {
                    submitData.append(key, value);
                }
            });

            // Add file fields
            if (formData.avatar) {
                submitData.append('avatar', formData.avatar);
            }

            await router.post('/customer/store', submitData, {
                forceFormData: true,
                onSuccess: () => {
                    // Will be redirected by the controller
                },
                onError: (errors) => {
                    console.error('Store creation failed:', errors);
                }
            });
        } catch (error) {
            console.error('Store creation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = formData.store_name.trim() && formData.description.trim();

    return (
        <CustomerLayout>
            <Head title="Tạo cửa hàng mới" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link href="/customer/store">
                            <Button variant="outline" size="sm">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Quay lại
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Tạo cửa hàng mới</h1>
                            <p className="text-gray-600">Thiết lập thông tin cửa hàng của bạn</p>
                        </div>
                    </div>
                </div>

                {/* Success/Error Messages */}
                {message && (
                    <Alert>
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                        <AlertDescription>
                            <ul className="list-disc list-inside space-y-1">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}>{error}</li>
                                ))}
                            </ul>
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-4">
                    {/* Basic Information */}
                    <Card className="col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5" />
                                Thông tin cơ bản
                            </CardTitle>
                            <CardDescription>
                                Điền thông tin cơ bản về cửa hàng của bạn
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
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Image className="h-5 w-5" />
                                Hình ảnh cửa hàng
                            </CardTitle>
                            <CardDescription>
                                Tải lên logo cho cửa hàng của bạn
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="avatar">Logo cửa hàng</Label>
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
                            {loading ? 'Đang tạo...' : 'Tạo cửa hàng'}
                        </Button>
                    </div>
                </form>
            </div>
        </CustomerLayout>
    );
}
