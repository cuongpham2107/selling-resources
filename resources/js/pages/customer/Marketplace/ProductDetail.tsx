import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
    Dialog, 
    DialogContent, 
    DialogDescription, 
    DialogFooter, 
    DialogHeader, 
    DialogTitle, 
    DialogClose,
    DialogTrigger 
} from '@/components/ui/dialog';
import { formatVND } from '@/lib/currency';
import { formatDate } from '@/lib/date';
import {
    ArrowLeft,
    Star,
    ShoppingCart,
    Store,
    Package,
    Verified,
    Eye,
    Calendar,
    User,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import type { StoreProduct, Customer } from '@/types';

interface ProductWithStore extends Omit<StoreProduct, 'store'> {
    store: {
        id: number;
        owner_id: number;
        store_name: string;
        description: string;
        rating: number;
        is_verified: boolean;
        total_sales: number;
        total_products: number;
    };
    transactions: Array<{
        id: number;
        buyer: {
            id: number;
            username: string;
        };
        amount: number;
        created_at: string;
    }>;
}

interface Props {
    product: ProductWithStore;
    relatedProducts: StoreProduct[];
    similarProducts: Array<StoreProduct & { store_id: number }>;
    currentUser: Customer;
    analytics: {
        total_sales: number;
        total_orders: number;
        recent_sales: Array<{
            id: number;
            buyer_id: number;
            amount: number;
            created_at: string;
        }>;
    };
}

export default function ProductDetail({ product, relatedProducts, similarProducts, currentUser, analytics }: Props) {
    const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
    const [isPurchaseDialogOpen, setIsPurchaseDialogOpen] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);

    const canPurchase = product.is_active && !product.is_sold && (currentUser.balance?.available_balance || currentUser.available_balance_computed || 0) >= product.price;
   
    const isOwnProduct = product.store.owner_id === currentUser.id;

    const handlePurchase = async () => {
        if (!canPurchase || isOwnProduct) return;

        setIsProcessing(true);
        try {
            await router.post(`/customer/marketplace/product/${product.id}/purchase`);
        } catch (error) {
            console.error('Purchase failed:', error);
        } finally {
            setIsProcessing(false);
            setIsPurchaseDialogOpen(false);
        }
    };

    return (
        <CustomerLayout>
            <Head title={`${product.name} - Chi tiết sản phẩm`} />

            <div className="mx-auto max-w-6xl space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/customer/marketplace" className="hover:text-blue-600">
                        Marketplace
                    </Link>
                    <span>›</span>
                    <Link
                        href={`/customer/marketplace/store/${product.store.id}`}
                        className="hover:text-blue-600"
                    >
                        {product.store.store_name}
                    </Link>
                    <span>›</span>
                    <span className="text-gray-900">{product.name}</span>
                </div>

                {/* Back button */}
                <Link href="/customer/marketplace">
                    <Button variant="ghost" className="mb-4">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại Marketplace
                    </Button>
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Product Images */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardContent className="p-6">
                                {/* Main Image */}
                                <div className="mb-4">
                                    {product.images && product.images.length > 0 ? (
                                        <img
                                            src={`/storage/${product.images[selectedImageIndex]}`}
                                            alt={product.name}
                                            className="w-full h-96 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <Package className="h-24 w-24 text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Thumbnail Images */}
                                {product.images && product.images.length > 1 && (
                                    <div className="flex gap-2 overflow-x-auto">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImageIndex(index)}
                                                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 ${selectedImageIndex === index ? 'border-blue-500' : 'border-gray-200'
                                                    }`}
                                            >
                                                <img
                                                    src={`/storage/${image}`}
                                                    alt={`${product.name} ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Product Description */}
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Mô tả sản phẩm</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="prose max-w-none">
                                    <p className="text-gray-700 whitespace-pre-wrap">
                                        {product.description}
                                    </p>
                                    {product.content && (
                                        <div className="mt-4 pt-4 border-t">
                                            <h4 className="font-semibold mb-2">Chi tiết:</h4>
                                            <div className="text-gray-700 whitespace-pre-wrap">
                                                {product.content}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Product Info & Purchase */}
                    <div className="space-y-6">
                        {/* Product Details */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-2xl">{product.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Price */}
                                <div className="text-3xl font-bold text-green-600">
                                    {formatVND(product.price)}
                                </div>

                                {/* Status */}
                                <div className="flex gap-2">
                                    <Badge variant={product.is_active ? 'default' : 'secondary'}>
                                        {product.is_active ? 'Có sẵn' : 'Tạm ngưng'}
                                    </Badge>
                                    {product.is_sold && (
                                        <Badge variant="destructive">Đã bán</Badge>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="grid grid-rows-2 gap-4 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Eye className="h-4 w-4 text-gray-500" />
                                        <span>{analytics.total_orders} lượt mua</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-500" />
                                        <span>{formatDate(product.created_at)}</span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                {product.is_active && !product.is_sold && !isOwnProduct && (
                                    <div className="space-y-3">
                                        <div className="flex gap-2">
                                            <Dialog open={isPurchaseDialogOpen} onOpenChange={setIsPurchaseDialogOpen}>
                                                <DialogTrigger asChild>
                                                    <Button 
                                                        className="w-full" 
                                                        size="lg"
                                                        disabled={!canPurchase}
                                                    >
                                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                                        {canPurchase ? `Mua ngay - ${formatVND(product.price)}` : 'Không đủ số dư'}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-md">
                                                    <DialogHeader>
                                                        <DialogTitle className="flex items-center gap-2">
                                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                                            Xác nhận mua hàng
                                                        </DialogTitle>
                                                        <DialogDescription>
                                                            Xác nhận thông tin mua hàng của bạn
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    
                                                    <div className="space-y-4">
                                                        {/* Product Info */}
                                                        <div className="border rounded-lg p-3">
                                                            <div className="flex gap-3">
                                                                {product.images && product.images.length > 0 ? (
                                                                    <img
                                                                        src={`/storage/${product.images[0]}`}
                                                                        alt={product.name}
                                                                        className="w-16 h-16 object-cover rounded"
                                                                    />
                                                                ) : (
                                                                    <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-gray-400" />
                                                                    </div>
                                                                )}
                                                                <div className="flex-1">
                                                                    <h4 className="font-medium text-sm">{product.name}</h4>
                                                                    <p className="text-xs text-gray-500">{product.store.store_name}</p>
                                                                    <p className="font-semibold text-green-600">{formatVND(product.price)}</p>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Balance Info */}
                                                        <div className="border rounded-lg p-3 bg-gray-50">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span>Số dư hiện tại:</span>
                                                                <span className="font-medium">{formatVND((currentUser.balance?.available_balance || currentUser.available_balance_computed || 0))}</span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span>Số tiền cần thanh toán:</span>
                                                                <span className="font-medium text-red-600">-{formatVND(product.price)}</span>
                                                            </div>
                                                            <hr className="my-2" />
                                                            <div className="flex justify-between items-center text-sm font-medium">
                                                                <span>Số dư sau khi mua:</span>
                                                                <span className={`${((currentUser.balance?.available_balance || currentUser.available_balance_computed || 0) - product.price) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                    {formatVND((currentUser.balance?.available_balance || currentUser.available_balance_computed || 0) - product.price)}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {/* Warning if insufficient balance */}
                                                        {!canPurchase && (
                                                            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                                                                <AlertCircle className="h-4 w-4 text-red-600" />
                                                                <span className="text-sm text-red-700">
                                                                    Số dư không đủ để thực hiện giao dịch này
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <DialogFooter className="sm:justify-start">
                                                        <Button 
                                                            onClick={handlePurchase}
                                                            disabled={!canPurchase || isProcessing}
                                                            className="flex-1"
                                                        >
                                                            {isProcessing ? 'Đang xử lý...' : 'Xác nhận mua hàng'}
                                                        </Button>
                                                        <DialogClose asChild>
                                                            <Button type="button" variant="secondary" disabled={isProcessing}>
                                                                Hủy
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                            
                                        </div>
                                    </div>
                                )}

                                {/* Show message for own product */}
                                {isOwnProduct && (
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <p className="text-sm text-blue-700">Đây là sản phẩm của bạn</p>
                                    </div>
                                )}

                                {/* Show message for sold product */}
                                {product.is_sold && (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-sm text-gray-700">Sản phẩm đã được bán</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Store Info */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Store className="h-5 w-5" />
                                    Thông tin cửa hàng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Link
                                        href={`/customer/marketplace/store/${product.store.id}`}
                                        className="font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        {product.store.store_name}
                                        {product.store.is_verified && (
                                            <Verified className="h-4 w-4 text-blue-500" />
                                        )}
                                    </Link>
                                    <div className="flex items-center gap-1">
                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                        <span className="text-sm">{product.store.rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 line-clamp-2">
                                    {product.store.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-500">Sản phẩm:</span>
                                        <div className="font-semibold">{product.store.total_products}</div>
                                    </div>
                                    <div>
                                        <span className="text-gray-500">Doanh số:</span>
                                        <div className="font-semibold">{formatVND(product.store.total_sales)}</div>
                                    </div>
                                </div>

                                <Link href={`/customer/marketplace/store/${product.store.id}`}>
                                    <Button variant="outline" className="w-full">
                                        Xem cửa hàng
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Recent Sales */}
                        {analytics.recent_sales.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Giao dịch gần đây</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-3">
                                        {analytics.recent_sales.slice(0, 3).map((sale) => (
                                            <div key={sale.id} className="flex items-center justify-between text-sm">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <User className="h-3 w-3 text-blue-600" />
                                                    </div>
                                                    <span className="text-gray-600">Đã mua</span>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-semibold text-green-600">
                                                        {formatVND(sale.amount)}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {formatDate(sale.created_at)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm khác từ cửa hàng này</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {relatedProducts.map((relatedProduct) => (
                                    <Link
                                        key={relatedProduct.id}
                                        href={`/customer/marketplace/product/${relatedProduct.id}`}
                                        className="group"
                                    >
                                        <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                            {relatedProduct.images && relatedProduct.images.length > 0 ? (
                                                <img
                                                    src={`/storage/${relatedProduct.images[0]}`}
                                                    alt={relatedProduct.name}
                                                    className="w-full h-24 object-cover rounded mb-2"
                                                />
                                            ) : (
                                                <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                                                {relatedProduct.name}
                                            </h4>
                                            <p className="text-green-600 font-semibold mt-1">
                                                {formatVND(relatedProduct.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Similar Products */}
                {similarProducts.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Sản phẩm tương tự</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {similarProducts.map((similarProduct) => (
                                    <Link
                                        key={similarProduct.id}
                                        href={`/customer/marketplace/product/${similarProduct.id}`}
                                        className="group"
                                    >
                                        <div className="border rounded-lg p-3 hover:shadow-md transition-shadow">
                                            {similarProduct.images && similarProduct.images.length > 0 ? (
                                                <img
                                                    src={`/storage/${similarProduct.images[0]}`}
                                                    alt={similarProduct.name}
                                                    className="w-full h-24 object-cover rounded mb-2"
                                                />
                                            ) : (
                                                <div className="w-full h-24 bg-gray-200 rounded mb-2 flex items-center justify-center">
                                                    <Package className="h-8 w-8 text-gray-400" />
                                                </div>
                                            )}
                                            <h4 className="font-medium text-sm line-clamp-2 group-hover:text-blue-600">
                                                {similarProduct.name}
                                            </h4>
                                            <p className="text-green-600 font-semibold mt-1">
                                                {formatVND(similarProduct.price)}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
