import React from 'react';
import { Head, router } from '@inertiajs/react';
import CustomerLayout from '@/layouts/CustomerLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Gift,
    Calendar,
    User,
    Users,
    CheckCircle,
    Clock,
    Coins,
    Star
} from 'lucide-react';

interface EarningMethod {
    id: string;
    name: string;
    description: string;
    points: number;
    available: boolean;
}

interface Props {
    earningMethods: EarningMethod[];
}

export default function Earn({ earningMethods }: Props) {
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [processingMethod, setProcessingMethod] = React.useState<string | null>(null);

    const handleClaim = async (method: EarningMethod) => {
        if (!method.available) return;

        setIsProcessing(true);
        setProcessingMethod(method.id);
        
        try {
            await router.post('/customer/points/earn', {
                method_id: method.id,
                points: method.points
            });
        } catch (error) {
            console.error('Claim failed:', error);
        } finally {
            setIsProcessing(false);
            setProcessingMethod(null);
        }
    };

    const getMethodIcon = (id: string) => {
        switch (id) {
            case 'daily_login':
                return <Calendar className="h-6 w-6" />;
            case 'complete_profile':
                return <User className="h-6 w-6" />;
            case 'refer_friend':
                return <Users className="h-6 w-6" />;
            default:
                return <Gift className="h-6 w-6" />;
        }
    };

    const getMethodColor = (id: string) => {
        switch (id) {
            case 'daily_login':
                return 'bg-blue-500';
            case 'complete_profile':
                return 'bg-green-500';
            case 'refer_friend':
                return 'bg-purple-500';
            default:
                return 'bg-gray-500';
        }
    };

    const availableMethods = earningMethods.filter(m => m.available);
    const completedMethods = earningMethods.filter(m => !m.available);

    return (
        <CustomerLayout>
            <Head title="Kiếm điểm" />

            <div className="mx-auto max-w-4xl space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Kiếm điểm</h1>
                        <p className="text-gray-600">Hoàn thành các nhiệm vụ để kiếm điểm</p>
                    </div>
                </div>

                {/* Progress Overview */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Star className="h-5 w-5" />
                            Tiến độ hoàn thành
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">
                                    Đã hoàn thành {completedMethods.length} / {earningMethods.length} nhiệm vụ
                                </span>
                                <span className="text-sm text-gray-500">
                                    {Math.round((completedMethods.length / earningMethods.length) * 100)}%
                                </span>
                            </div>
                            <Progress 
                                value={(completedMethods.length / earningMethods.length) * 100} 
                                className="h-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Available Methods */}
                {availableMethods.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Nhiệm vụ có thể thực hiện</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {availableMethods.map((method) => {
                                const isProcessingThis = processingMethod === method.id;

                                return (
                                    <Card key={method.id} className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-colors">
                                        <CardHeader>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-3 rounded-full ${getMethodColor(method.id)} text-white`}>
                                                        {getMethodIcon(method.id)}
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-lg">{method.name}</CardTitle>
                                                        <Badge variant="secondary" className="mt-1">
                                                            <Coins className="h-3 w-3 mr-1" />
                                                            +{method.points} điểm
                                                        </Badge>
                                                    </div>
                                                </div>
                                                <Clock className="h-5 w-5 text-orange-500" />
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600 mb-4">
                                                {method.description}
                                            </p>
                                            
                                            <Button
                                                onClick={() => handleClaim(method)}
                                                disabled={isProcessing}
                                                className="w-full"
                                            >
                                                {isProcessingThis ? (
                                                    'Đang xử lý...'
                                                ) : (
                                                    <>
                                                        <Gift className="h-4 w-4 mr-2" />
                                                        Nhận {method.points} điểm
                                                    </>
                                                )}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Completed Methods */}
                {completedMethods.length > 0 && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold">Nhiệm vụ đã hoàn thành</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {completedMethods.map((method) => (
                                <Card key={method.id} className="opacity-60">
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 rounded-full bg-green-500 text-white">
                                                    {getMethodIcon(method.id)}
                                                </div>
                                                <div>
                                                    <CardTitle className="text-lg">{method.name}</CardTitle>
                                                    <Badge variant="secondary" className="mt-1">
                                                        <Coins className="h-3 w-3 mr-1" />
                                                        +{method.points} điểm
                                                    </Badge>
                                                </div>
                                            </div>
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4">
                                            {method.description}
                                        </p>
                                        
                                        <Button
                                            disabled
                                            variant="secondary"
                                            className="w-full"
                                        >
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Đã hoàn thành
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Empty State */}
                {earningMethods.length === 0 && (
                    <Card>
                        <CardContent className="text-center py-12">
                            <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Không có nhiệm vụ nào
                            </h3>
                            <p className="text-gray-600">
                                Hiện tại chưa có nhiệm vụ nào để kiếm điểm. Vui lòng quay lại sau!
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </CustomerLayout>
    );
}
