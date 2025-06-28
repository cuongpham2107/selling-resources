import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, X } from 'lucide-react';
import type { PersonalStore } from '@/types';

interface Props {
    store: PersonalStore;
}

export default function Create({ store }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        content: '',
        is_active: true,
    });
    const [selectedImages, setSelectedImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + selectedImages.length > 5) {
            alert('Tối đa 5 hình ảnh');
            return;
        }

        setSelectedImages(prev => [...prev, ...files]);
        
        // Create preview URLs
        files.forEach(file => {
            const url = URL.createObjectURL(file);
            setPreviewUrls(prev => [...prev, url]);
        });
    };

    const removeImage = (index: number) => {
        URL.revokeObjectURL(previewUrls[index]);
        setSelectedImages(prev => prev.filter((_, i) => i !== index));
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProcessing(true);
        
        const form = new FormData();
        form.append('name', formData.name);
        form.append('description', formData.description);
        form.append('price', formData.price);
        form.append('content', formData.content);
        form.append('is_active', formData.is_active ? '1' : '0');
        
        selectedImages.forEach((file, index) => {
            form.append(`images[${index}]`, file);
        });

        router.post(route('customer.products.store'), form, {
            onSuccess: () => {
                setProcessing(false);
            },
            onError: (errors) => {
                setErrors(errors);
                setProcessing(false);
            }
        });
    };

    const updateFormData = (field: string, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <CustomerLayout>
            <Head title="Tạo sản phẩm mới" />

            <div className="container mx-auto py-6">
                <div className="mb-6">
                    <Link
                        href={route('customer.products.index')}
                        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Quay lại danh sách sản phẩm
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Tạo sản phẩm mới</CardTitle>
                        <CardDescription>
                            Thêm sản phẩm mới vào shop "{store.store_name}" của bạn
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">Tên sản phẩm *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={e => updateFormData('name', e.target.value)}
                                    placeholder="Nhập tên sản phẩm"
                                    className={errors.name ? 'border-red-500' : ''}
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-500">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={e => updateFormData('description', e.target.value)}
                                    placeholder="Mô tả chi tiết về sản phẩm"
                                    rows={4}
                                    className={errors.description ? 'border-red-500' : ''}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-500">{errors.description}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="price">Giá (VNĐ) *</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.price}
                                    onChange={e => updateFormData('price', e.target.value)}
                                    placeholder="0.00"
                                    className={errors.price ? 'border-red-500' : ''}
                                />
                                {errors.price && (
                                    <p className="text-sm text-red-500">{errors.price}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="content">Nội dung chi tiết</Label>
                                <Textarea
                                    id="content"
                                    value={formData.content}
                                    onChange={e => updateFormData('content', e.target.value)}
                                    placeholder="Nội dung chi tiết về sản phẩm (tùy chọn)"
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Hình ảnh sản phẩm</Label>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-center w-full">
                                        <label
                                            htmlFor="images"
                                            className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Upload className="w-8 h-8 mb-2 text-gray-500" />
                                                <p className="mb-2 text-sm text-gray-500">
                                                    <span className="font-semibold">Nhấn để tải ảnh</span> hoặc kéo thả
                                                </p>
                                                <p className="text-xs text-gray-500">PNG, JPG tối đa 5MB (Tối đa 5 ảnh)</p>
                                            </div>
                                            <input
                                                id="images"
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {previewUrls.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                            {previewUrls.map((url, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={url}
                                                        alt={`Preview ${index + 1}`}
                                                        className="w-full h-24 object-cover rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {errors.images && (
                                    <p className="text-sm text-red-500">{errors.images}</p>
                                )}
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => updateFormData('is_active', e.target.checked)}
                                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <Label htmlFor="is_active">Kích hoạt sản phẩm</Label>
                            </div>

                            <div className="flex items-center justify-end space-x-4">
                                <Link
                                    href={route('customer.products.index')}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Hủy
                                </Link>
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Đang tạo...' : 'Tạo sản phẩm'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </CustomerLayout>
    );
}
