import React from 'react';
import { Head, Link } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/date';
import { Plus, Eye, Edit, ShoppingBag } from 'lucide-react';
import type { StoreProduct, PersonalStore } from '@/types';

interface ProductWithSales extends StoreProduct {
    sales_count: number;
}

interface PaginatedProducts {
    data: ProductWithSales[];
    total: number;
    last_page: number;
    links: Array<{
        url?: string;
        label: string;
        active: boolean;
    }>;
}

interface Props {
    store: PersonalStore;
    products: PaginatedProducts;
}

export default function ProductsIndex({ store, products }: Props) {
    return (
        <CustomerLayout>
            <Head title="My Products" />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">My Products</h1>
                        <p className="text-gray-600">
                            Manage your store products
                        </p>
                    </div>
                    <Link href={route('customer.products.create')}>
                        <Button>
                            <Plus className="h-4 w-4 mr-2" />
                            Add Product
                        </Button>
                    </Link>
                </div>

                {/* Store Info */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5" />
                            {store.store_name}
                        </CardTitle>
                        <CardDescription>
                            {store.description}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>Total Products: {products.total}</span>
                            <span>•</span>
                            <span>Active Products: {products.data.filter((p: ProductWithSales) => p.is_active && !p.is_sold).length}</span>
                            <span>•</span>
                            <span>Sold Products: {products.data.filter((p: ProductWithSales) => p.is_sold).length}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Products Grid */}
                {products.data.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {products.data.map((product) => (
                            <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                                <CardHeader className="pb-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg mb-2 line-clamp-2">
                                                {product.name}
                                            </CardTitle>
                                            <CardDescription className="line-clamp-3">
                                                {product.description}
                                            </CardDescription>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <Badge variant={product.is_active && !product.is_sold ? 'default' : 'secondary'}>
                                                {product.is_sold ? 'Đã bán' : product.is_active ? 'Hoạt động' : 'Không hoạt động'}
                                            </Badge>
                                            {product.is_deleted && (
                                                <Badge variant="destructive">Đã xóa</Badge>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                                
                                <CardContent className="pt-0">
                                    {/* Product Image */}
                                    {product.images && product.images.length > 0 && (
                                        <div className="mb-4 aspect-video bg-gray-100 rounded-lg overflow-hidden">
                                            <img 
                                                src={`/storage/${product.images[0]}`}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/placeholder-image.jpg';
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    {/* Price and Stats */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-2xl font-bold text-green-600">
                                                {new Intl.NumberFormat('vi-VN', { 
                                                    style: 'currency', 
                                                    currency: 'VND' 
                                                }).format(product.price)}
                                            </span>
                                            <span className="text-sm text-gray-500">
                                                {product.sales_count} sales
                                            </span>
                                        </div>
                                        
                                        <div className="text-sm text-gray-500">
                                            Created: {formatDate(product.created_at)}
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex gap-2 pt-2">
                                            <Link 
                                                href={route('customer.products.show', product.id)}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    View
                                                </Button>
                                            </Link>
                                            <Link 
                                                href={route('customer.products.edit', product.id)}
                                                className="flex-1"
                                            >
                                                <Button variant="outline" size="sm" className="w-full">
                                                    <Edit className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold mb-2">No products yet</h3>
                            <p className="text-gray-600 mb-4">
                                Start selling by adding your first product to your store.
                            </p>
                            <Link href={route('customer.products.create')}>
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Product
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* Pagination */}
                {products.last_page > 1 && (
                    <div className="flex justify-center">
                        <div className="flex items-center gap-2">                                {products.links.map((link: { url?: string; label: string; active: boolean }, index: number) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white text-gray-700 hover:bg-gray-50 border'
                                    } ${!link.url ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </CustomerLayout>
    );
}
