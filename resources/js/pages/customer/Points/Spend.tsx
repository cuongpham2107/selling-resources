import React from 'react';
import { Head, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatVND } from '@/lib/currency';
import {
    Coins,
    Zap,
    Shield,
    Star,
    ArrowRight
} from 'lucide-react';

interface SpendingOption {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: string;
}

interface Props {
    points: {
        id: number;
        customer_id: number;
        available_points: number;
        total_earned: number;
        total_spent: number;
        created_at: string;
        updated_at: string;
    } | null;
    spendingOptions: SpendingOption[];
}

export default function Spend({ points, spendingOptions }: Props) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [processingOption, setProcessingOption] = React.useState<string | null>(null);

    const handleSpend = async (option: SpendingOption) => {
        if (!points || points.available_points < option.cost) return;

        setIsProcessing(true);
        setProcessingOption(option.id);
        
        try {
            await router.post('/customer/points/spend', {
                option_id: option.id,
                cost: option.cost
            });
        } catch (error) {
            console.error('Spend failed:', error);
        } finally {
            setIsProcessing(false);
            setProcessingOption(null);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'discount':
                return <Zap className="h-5 w-5" />;
            case 'service':
                return <Shield className="h-5 w-5" />;
            case 'promotion':
                return <Star className="h-5 w-5" />;
            default:
                return <Coins className="h-5 w-5" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'discount':
                return 'bg-yellow-100 text-yellow-800';
            case 'service':
                return 'bg-blue-100 text-blue-800';
            case 'promotion':
                return 'bg-purple-100 text-purple-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <CustomerLayout>
            <Head title="Tiêu điểm" />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Tiêu điểm</h1>
                        <p className="text-gray-600">Sử dụng điểm để nhận các quyền lợi đặc biệt</p>
                    </div>
                </div>

                {/* Current Points */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Coins className="h-5 w-5" />
                            Điểm hiện tại
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold text-blue-600">
                                    {(points?.available_points || 0).toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500">Điểm khả dụng</p>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-semibold text-gray-700">
                                    {(points?.total_earned || 0).toLocaleString()}
                                </div>
                                <p className="text-sm text-gray-500">Tổng điểm kiếm được</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Spending Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {spendingOptions.map((option) => {
                        const canAfford = points && points.available_points >= option.cost;
                        const isProcessingThis = processingOption === option.id;

                        return (
                            <Card key={option.id} className={`relative ${!canAfford ? 'opacity-60' : ''}`}>
                                <CardHeader>
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-2">
                                            {getTypeIcon(option.type)}
                                            <CardTitle className="text-lg">{option.name}</CardTitle>
                                        </div>
                                        <Badge className={getTypeColor(option.type)}>
                                            {option.type}
                                        </Badge>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-600 mb-4 line-clamp-3">
                                        {option.description}
                                    </p>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-1">
                                            <Coins className="h-4 w-4 text-blue-500" />
                                            <span className="font-bold text-lg text-blue-600">
                                                {option.cost.toLocaleString()}
                                            </span>
                                            <span className="text-sm text-gray-500">điểm</span>
                                        </div>
                                    </div>

                                    {!canAfford && (
                                        <div className="mb-3 p-2 bg-red-50 rounded-lg">
                                            <p className="text-sm text-red-600">
                                                Cần thêm {(option.cost - (points?.available_points || 0)).toLocaleString()} điểm
                                            </p>
                                        </div>
                                    )}

                                    <Button
                                        onClick={() => handleSpend(option)}
                                        disabled={!canAfford || isProcessing}
                                        className="w-full"
                                    >
                                        {isProcessingThis ? (
                                            'Đang xử lý...'
                                        ) : (
                                            <>
                                                Sử dụng
                                                <ArrowRight className="h-4 w-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {spendingOptions.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Không có quyền lợi nào khả dụng
                            </h3>
                            <p className="text-gray-600">
                                Hiện tại chưa có quyền lợi nào để tiêu điểm. Vui lòng quay lại sau!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
